import json
from app.agents.base import run_agent
from app.agents.prompts.agent_13 import AGENT_13_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_13 import Agent13Output
from app.models.state import PipelineState


async def agent_13_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "frontend_modules": state.agent_08_output["modules"],
        "backend_modules": state.agent_11_output["modules"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "auth_strategy": state.agent_04_output["auth_strategy"],
    }

    result: Agent13Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_13_integration",
        model="claude-sonnet-5",
        system_prompt=AGENT_13_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent13Output,
        max_tokens=14000,
    )

    await _generate_agent_13_artifacts(state.run_id, result)

    return state.model_copy(
        update={
            "agent_13_output": result.model_dump(),
            "current_agent": "agent_13_integration",
            "status": "running",
        }
    )


async def _generate_agent_13_artifacts(run_id: str, output: Agent13Output):
    report_md = (
        "#### API Connections Wired\n"
        "| Frontend Call | Backend Endpoint | Status |\n|---|---|---|\n"
        + "\n".join(
            f"| {c.frontend_call} | {c.backend_endpoint} | "
            f"{'✅' if c.status == 'Connected' else '⚠️' if c.status == 'Mismatch' else '❌'} "
            f"{c.status} |"
            for c in output.api_connections
        )
    )
    if output.mismatches:
        report_md += "\n\n#### Mismatches Found\n" + "\n".join(
            f"- {m.id}: {m.description} → Fix: {m.fix}"
            for m in output.mismatches
        )
    if output.mock_data_removed:
        report_md += "\n\n#### Mock Data Removed\n" + "\n".join(
            f"- {m.file}: {m.description}" for m in output.mock_data_removed
        )
    await save_artifact(
        run_id, "agent_13_integration", "integration_report.md", report_md
    )

    for f in output.api_client_files:
        await save_artifact(run_id, "agent_13_integration", f.path, f.content)

    for env in output.env_configs:
        await save_artifact(run_id, "agent_13_integration", env.filename, env.content)
