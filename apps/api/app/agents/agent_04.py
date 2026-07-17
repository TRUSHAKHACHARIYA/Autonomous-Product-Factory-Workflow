import json
from app.agents.base import run_agent_with_approval
from app.agents.prompts.agent_04 import AGENT_04_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_04 import Agent04Output
from app.models.state import PipelineState


async def agent_04_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "user_input": state.agent_01_output["user_input"],
        "requirements": {
            "functional": state.agent_02_output["functional_requirements"],
            "non_functional": state.agent_02_output["non_functional_requirements"],
        },
        "complexity_score": state.agent_02_output["complexity_score"],
        "mvp_scope": state.agent_03_output["mvp_scope"],
        "tasks": state.agent_03_output["tasks"],
    }

    result: Agent04Output = await run_agent_with_approval(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_04_architecture",
        model="claude-sonnet-5",
        system_prompt=AGENT_04_SYSTEM_PROMPT,
        build_message=lambda notes: json.dumps(input_payload, indent=2) + (
            f"\n\nrevision_notes (mandatory corrections from reviewer):\n{notes}"
            if notes
            else ""
        ),
        output_schema=Agent04Output,
        max_tokens=16000,
    )

    await generate_agent_04_artifacts(state.run_id, result)

    return state.model_copy(
        update={
            "agent_04_output": result.model_dump(),
            "current_agent": "agent_04_architecture",
            "status": "running",
        }
    )


async def generate_agent_04_artifacts(run_id: str, output: Agent04Output):
    stack_md = (
        "| Layer | Technology | Why |\n|---|---|---|\n"
        + "\n".join(
            f"| {t.layer} | {t.technology} | {t.why} |" for t in output.tech_stack
        )
    )
    await save_artifact(run_id, "agent_04_architecture", "tech_stack.md", stack_md)

    arch_md = (
        f"- Architecture Pattern: {output.system_architecture.pattern}\n"
        f"- Components: {', '.join(output.system_architecture.components)}\n"
        f"- Data Flow: {output.system_architecture.data_flow}"
    )
    await save_artifact(
        run_id, "agent_04_architecture", "system_architecture.md", arch_md
    )
    await save_artifact(
        run_id, "agent_04_architecture", "database_schema.sql", output.database_schema_sql
    )
    await save_artifact(
        run_id, "agent_04_architecture", "api_contracts.yaml", output.api_contracts_yaml
    )
    await save_artifact(
        run_id, "agent_04_architecture", "folder_structure.md", output.folder_structure
    )

    auth_md = (
        f"- Method: {output.auth_strategy.method}\n"
        f"- Access token TTL: {output.auth_strategy.access_token_ttl}\n"
        f"- Refresh token TTL: {output.auth_strategy.refresh_token_ttl}\n"
        f"- OAuth providers: {', '.join(output.auth_strategy.oauth_providers) or 'None'}\n"
        f"- Password hashing: {output.auth_strategy.password_hashing}"
    )
    await save_artifact(
        run_id, "agent_04_architecture", "auth_strategy.md", auth_md
    )

    env_md = (
        f"- Dev: {output.environment_config.dev}\n"
        f"- Staging: {output.environment_config.staging}\n"
        f"- Prod: {output.environment_config.prod}"
    )
    await save_artifact(
        run_id, "agent_04_architecture", "environment_config.md", env_md
    )
