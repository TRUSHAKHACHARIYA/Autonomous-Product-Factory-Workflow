from fastapi import APIRouter, Depends
from uuid import uuid4
from app.deps import get_current_user, supabase_admin
from app.models.schemas import OrgCreate
from app.audit import log_audit_event

router = APIRouter(prefix="/orgs", tags=["orgs"])


@router.post("")
async def create_org(body: OrgCreate, user=Depends(get_current_user)):
    org_id = str(uuid4())
    supabase_admin.table("organizations").insert({
        "id": org_id, "name": body.name, "slug": body.slug,
    }).execute()
    supabase_admin.table("organization_members").insert({
        "organization_id": org_id, "user_id": user["id"], "role": "owner",
    }).execute()
    await log_audit_event(org_id, user["id"], "org_created", {"name": body.name})
    return {"org_id": org_id, "name": body.name, "slug": body.slug}


@router.get("")
async def list_orgs(user=Depends(get_current_user)):
    memberships = (
        supabase_admin.table("organization_members")
        .select("organization_id, role")
        .eq("user_id", user["id"])
        .execute()
    )
    org_ids = [m["organization_id"] for m in memberships.data]
    if not org_ids:
        return []
    orgs = supabase_admin.table("organizations").select("*").in_("id", org_ids).execute()
    return orgs.data
