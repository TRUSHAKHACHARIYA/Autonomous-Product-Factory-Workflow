import stripe
from fastapi import APIRouter, Depends, Request, HTTPException
from app.config import settings
from app.deps import get_current_org, get_current_user, supabase_admin
from app.billing.plans import PLAN_LIMITS
from app.audit import log_audit_event
from app.logging import log

stripe.api_key = settings.STRIPE_SECRET_KEY
router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout")
async def create_checkout_session(plan: str, org_id: str = Depends(get_current_org), user=Depends(get_current_user)):
    if plan not in PLAN_LIMITS:
        raise HTTPException(400, f"Invalid plan: {plan}")
    price_id = PLAN_LIMITS[plan]["price_id"]
    if not price_id:
        raise HTTPException(400, "Cannot checkout for this plan")
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/dashboard/billing?success=true",
        cancel_url=f"{settings.FRONTEND_URL}/dashboard/billing?canceled=true",
        client_reference_id=org_id,
        customer_email=user["email"],
    )
    return {"checkout_url": session.url}


@router.post("/portal")
async def create_portal_session(org_id: str = Depends(get_current_org)):
    org = supabase_admin.table("organizations").select("stripe_customer_id").eq("id", org_id).single().execute()
    if not org.data["stripe_customer_id"]:
        raise HTTPException(400, "No billing account found for this organization")
    session = stripe.billing_portal.Session.create(
        customer=org.data["stripe_customer_id"],
        return_url=f"{settings.FRONTEND_URL}/dashboard/billing",
    )
    return {"portal_url": session.url}


@router.get("/usage")
async def get_usage(org_id: str = Depends(get_current_org)):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    org = supabase_admin.table("organizations").select("plan").eq("id", org_id).single().execute()
    plan = org.data["plan"]
    limit = PLAN_LIMITS[plan]["runs_per_month"]

    counter = supabase_admin.table("usage_counters").select("runs_count").eq(
        "organization_id", org_id
    ).eq("period_start", period_start.isoformat()).execute()
    current_count = counter.data[0]["runs_count"] if counter.data else 0

    return {
        "plan": plan,
        "runs_used": current_count,
        "runs_limit": limit,
        "period_start": period_start.isoformat(),
    }


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(400, "Invalid webhook signature")

    already_processed = supabase_admin.table("processed_stripe_events").select("event_id").eq(
        "event_id", event["id"]
    ).execute()
    if already_processed.data:
        log.info("stripe.deduplicated", event_id=event["id"], event_type=event["type"])
        return {"status": "already processed"}

    log.info("stripe.received", event_id=event["id"], event_type=event["type"])

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        org_id = session["client_reference_id"]
        supabase_admin.table("organizations").update({
            "stripe_customer_id": session["customer"],
            "stripe_subscription_id": session["subscription"],
        }).eq("id", org_id).execute()
        await log_audit_event(org_id, org_id, "plan_activated", {
            "customer": session["customer"],
            "subscription": session["subscription"],
        })

    elif event["type"] in ("customer.subscription.updated", "customer.subscription.deleted"):
        sub = event["data"]["object"]
        plan = "free" if event["type"] == "customer.subscription.deleted" else _plan_from_price_id(
            sub["items"]["data"][0]["price"]["id"]
        )
        org = supabase_admin.table("organizations").select("id").eq(
            "stripe_customer_id", sub["customer"]
        ).single().execute()
        if not org.data:
            raise HTTPException(500, "Organization not found for Stripe customer — retry later")
        update_fields = {
            "plan": plan,
            "stripe_subscription_id": sub["id"],
            "current_period_end": _to_iso(sub["current_period_end"]),
        }
        if event["type"] == "customer.subscription.updated" and sub.get("status") == "active":
            update_fields["billing_status"] = "active"
        supabase_admin.table("organizations").update(update_fields).eq("id", org.data["id"]).execute()
        await log_audit_event(org.data["id"], org.data["id"], "plan_changed", {
            "plan": plan,
        })

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        customer_id = invoice.get("customer")
        if customer_id:
            org = supabase_admin.table("organizations").select("id").eq(
                "stripe_customer_id", customer_id
            ).single().execute()
            if org.data:
                supabase_admin.table("organizations").update({
                    "billing_status": "past_due",
                }).eq("id", org.data["id"]).execute()
                log.warning("stripe.payment_failed", org_id=org.data["id"], invoice_id=invoice["id"])
                await log_audit_event(org.data["id"], org.data["id"], "payment_failed", {
                    "invoice_id": invoice["id"],
                })

    supabase_admin.table("processed_stripe_events").insert({"event_id": event["id"]}).execute()
    return {"status": "processed"}


def _plan_from_price_id(price_id: str) -> str:
    for plan, cfg in PLAN_LIMITS.items():
        if cfg["price_id"] == price_id:
            return plan
    return "free"


def _to_iso(unix_ts: int) -> str:
    from datetime import datetime, timezone
    return datetime.fromtimestamp(unix_ts, tz=timezone.utc).isoformat()
