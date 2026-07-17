import json
from app.deps import supabase_admin


async def save_artifact(run_id: str, agent_name: str, filename: str, content: str):
    path = f"{run_id}/{agent_name}/{filename}"
    supabase_admin.storage.from_("pipeline-artifacts").upload(path, content.encode())
    return path


async def generate_agent_01_artifacts(run_id: str, output: "Agent01Output"):
    from app.models.agent_01 import Agent01Output

    await save_artifact(
        run_id,
        "agent_01_input_layer",
        "user_input.json",
        json.dumps(output.user_input.model_dump(), indent=2),
    )

    readiness = output.validation_report.overall_readiness
    md = f"""# Validation Report
- Project name: {"✅" if output.validation_report.project_name_present else "❌"}
- Description: {"✅" if output.validation_report.description_present else "❌"}
- Platform identified: {"✅" if output.validation_report.platform_identified else "❌"}

**Overall readiness: {readiness}**
"""
    await save_artifact(run_id, "agent_01_input_layer", "validation_report.md", md)
