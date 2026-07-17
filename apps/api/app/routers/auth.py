from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/config")
async def auth_config():
    return {
        "supabase_url": settings.SUPABASE_URL,
        "supabase_anon_key": settings.SUPABASE_ANON_KEY,
    }
