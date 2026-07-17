from fastapi import Depends, HTTPException, Header
from supabase import create_client
from app.config import settings

supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def get_current_user(authorization: str = Header(...)) -> dict:
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase_admin.auth.get_user(token)
        return user.user.model_dump()
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


async def get_current_org(
    x_organization_id: str = Header(...),
    user: dict = Depends(get_current_user),
) -> str:
    membership = (
        supabase_admin.table("organization_members")
        .select("id")
        .eq("organization_id", x_organization_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not membership.data:
        raise HTTPException(403, "Not a member of this organization")
    return x_organization_id
