import json
from app.deps import supabase_admin


async def save_artifact(run_id: str, agent_name: str, filename: str, content: str):
    path = f"{run_id}/{agent_name}/{filename}"
    supabase_admin.storage.from_("pipeline-artifacts").upload(path, content.encode())
    return path
