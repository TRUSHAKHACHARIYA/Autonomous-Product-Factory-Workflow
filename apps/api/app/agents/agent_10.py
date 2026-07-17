import json
from app.agents.base import run_agent
from app.agents.prompts.agent_10 import AGENT_10_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_10 import Agent10Output
from app.models.state import PipelineState


async def agent_10_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "tech_stack": state.agent_04_output["tech_stack"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "database_schema_sql": state.agent_04_output["database_schema_sql"],
        "auth_strategy": state.agent_04_output["auth_strategy"],
        "security_checklist": state.agent_05_output["security_checklist"],
        "tasks": state.agent_03_output["tasks"],
    }

    result: Agent10Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_10_backend_senior",
        model="claude-sonnet-5",
        system_prompt=AGENT_10_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent10Output,
        max_tokens=10000,
    )

    await _generate_agent_10_artifacts(state.run_id, result)

    return state.model_copy(
        update={
            "agent_10_output": result.model_dump(),
            "current_agent": "agent_10_backend_senior",
            "status": "running",
        }
    )


async def _generate_agent_10_artifacts(run_id: str, output: Agent10Output):
    plan_md = (
        "| Module | Endpoints | Dependencies |\n|---|---|---|\n"
        + "\n".join(
            f"| {m.module_name} | {', '.join(m.endpoints)} | {', '.join(m.dependencies) or 'none'} |"
            for m in output.module_plan
        )
    )
    await save_artifact(run_id, "agent_10_backend_senior", "be_module_plan.md", plan_md)

    chain_md = " → ".join(output.middleware_chain.chain)
    await save_artifact(run_id, "agent_10_backend_senior", "be_middleware_chain.md", chain_md)

    err = output.error_strategy
    error_md = (
        f"```\n{err.standard_response_shape}\n```\n\n#### Error Codes\n"
        + "\n".join(f"- {c}" for c in err.error_codes)
    )
    await save_artifact(run_id, "agent_10_backend_senior", "be_error_strategy.md", error_md)

    b = output.boilerplate_setup
    boilerplate_md = (
        "```bash\n" + "\n".join(b.setup_commands) + "\n```\n\n"
        + "#### Key Dependencies\n"
        + "\n".join(f"- {d}" for d in b.key_dependencies)
        + "\n\n#### Config Files\n"
        + "\n".join(f"- {c}" for c in b.config_files)
    )
    await save_artifact(run_id, "agent_10_backend_senior", "be_boilerplate_setup.md", boilerplate_md)

    log = output.logging_strategy
    logging_md = (
        f"- Tool: {log.tool}\n- Log levels: {', '.join(log.log_levels)}\n"
        f"- Format (prod): {log.format_prod}\n- Format (dev): {log.format_dev}\n"
        f"- Never log: {', '.join(log.never_log)}"
    )
    await save_artifact(run_id, "agent_10_backend_senior", "be_logging_strategy.md", logging_md)
