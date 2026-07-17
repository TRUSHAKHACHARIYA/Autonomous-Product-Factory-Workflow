import secrets
from fastapi import APIRouter, Depends, HTTPException
from app.deps import get_current_org, get_current_user, supabase_admin
from app.billing.plans import PLAN_LIMITS
from app.audit import log_audit_event

org_router = APIRouter(prefix="/orgs/{org_id}", tags=["teams"])
invitations_router = APIRouter(prefix="/invitations", tags=["invitations"])


async def _require_role(org_id: str, user: dict, allowed: list[str]):
    membership = supabase_admin.table("organization_members").select("role").eq(
        "organization_id", org_id
    ).eq("user_id", user["id"]).single().execute()
    if membership.data["role"] not in allowed:
        raise HTTPException(403, f"Requires one of roles: {allowed}")


@org_router.post("/invitations")
async def invite_member(
    org_id: str,
    email: str,
    role: str = "member",
    user=Depends(get_current_user),
):
    await _require_role(org_id, user, ["owner", "admin"])

    org = supabase_admin.table("organizations").select("plan").eq("id", org_id).single().execute()
    seat_limit = PLAN_LIMITS[org.data["plan"]]["seats"]
    if seat_limit is not None:
        current_members = supabase_admin.table("organization_members").select(
            "id", count="exact"
        ).eq("organization_id", org_id).execute()
        if current_members.count >= seat_limit:
            raise HTTPException(
                402,
                f"Seat limit ({seat_limit}) reached for current plan. Upgrade to invite more members.",
            )

    token = secrets.token_urlsafe(32)
    supabase_admin.table("invitations").insert({
        "organization_id": org_id,
        "email": email,
        "role": role,
        "invited_by": user["id"],
        "token": token,
    }).execute()

    await log_audit_event(org_id, user["id"], "member_invited", {
        "email": email,
        "role": role,
    })

    return {"status": "invited", "token": token}


@org_router.get("/invitations")
async def list_invitations(org_id: str, user=Depends(get_current_user)):
    invites = supabase_admin.table("invitations").select("*").eq(
        "organization_id", org_id
    ).eq("status", "pending").execute()
    return invites.data


@org_router.get("/members")
async def list_members(org_id: str, user=Depends(get_current_user)):
    members = supabase_admin.table("organization_members").select("*").eq(
        "organization_id", org_id
    ).execute()
    return members.data


@invitations_router.post("/{token}/accept")
async def accept_invitation(token: str, user=Depends(get_current_user)):
    invite = supabase_admin.table("invitations").select("*").eq(
        "token", token
    ).eq("status", "pending").single().execute()
    if not invite.data:
        raise HTTPException(404, "Invalid or expired invitation")

    supabase_admin.table("organization_members").insert({
        "organization_id": invite.data["organization_id"],
        "user_id": user["id"],
        "role": invite.data["role"],
    }).execute()
    supabase_admin.table("invitations").update({"status": "accepted"}).eq("token", token).execute()

    await log_audit_event(
        invite.data["organization_id"],
        user["id"],
        "member_joined",
        {"role": invite.data["role"]},
    )

    return {"status": "joined", "organization_id": invite.data["organization_id"]}
