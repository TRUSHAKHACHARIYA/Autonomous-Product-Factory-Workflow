from datetime import datetime, timezone
from fastapi import HTTPException
from app.deps import supabase_admin
from app.billing.plans import PLAN_LIMITS
from app.logging import log


async def check_run_quota(org_id: str):
    org = supabase_admin.table("organizations").select("plan").eq("id", org_id).single().execute()
    plan = org.data["plan"]
    limit = PLAN_LIMITS[plan]["runs_per_month"]
    if limit is None:
        return

    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    counter = supabase_admin.table("usage_counters").select("runs_count").eq(
        "organization_id", org_id
    ).eq("period_start", period_start.isoformat()).execute()

    current_count = counter.data[0]["runs_count"] if counter.data else 0
    log.info("quota.check", org_id=org_id, plan=plan, current=current_count, limit=limit)
    if current_count >= limit:
        log.warning("quota.exceeded", org_id=org_id, plan=plan, current=current_count, limit=limit)
        raise HTTPException(
            402,
            f"Monthly run limit ({limit}) reached for the {plan} plan. Upgrade to continue.",
        )


async def increment_run_usage(org_id: str):
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if period_start.month < 12:
        period_end = period_start.replace(month=period_start.month + 1)
    else:
        period_end = period_start.replace(year=period_start.year + 1, month=1)
    supabase_admin.rpc("increment_usage_counter", {
        "p_org_id": org_id,
        "p_period_start": period_start.isoformat(),
        "p_period_end": period_end.isoformat(),
    }).execute()
    log.info("quota.incremented", org_id=org_id, period_start=period_start.isoformat())


ACTIVE_RUN_STATUSES = ["pending", "running", "awaiting_approval", "awaiting_clarification"]


async def check_concurrent_runs(org_id: str):
    org = supabase_admin.table("organizations").select("plan").eq("id", org_id).single().execute()
    plan = org.data["plan"]
    limit = PLAN_LIMITS[plan]["max_concurrent_runs"]

    result = supabase_admin.table("pipeline_runs").select("id", count="exact").eq(
        "organization_id", org_id
    ).in_("status", ACTIVE_RUN_STATUSES).execute()
    active_count = result.count or 0

    log.info("concurrent.check", org_id=org_id, plan=plan, active=active_count, limit=limit)
    if active_count >= limit:
        log.warning("concurrent.exceeded", org_id=org_id, plan=plan, active=active_count, limit=limit)
        raise HTTPException(
            402,
            f"Max {limit} concurrent run(s) for the {plan} plan — wait for one to finish.",
        )
