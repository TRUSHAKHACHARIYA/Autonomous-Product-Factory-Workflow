from datetime import datetime, timezone
from app.deps import supabase_admin


async def log_audit_event(org_id: str, actor_id: str, action: str, metadata: dict | None = None):
    supabase_admin.table("audit_logs").insert({
        "organization_id": org_id,
        "actor_id": actor_id,
        "action": action,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
