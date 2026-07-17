import json
from app.agents.base import run_agent
from app.agents.prompts.agent_07 import AGENT_07_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_07 import Agent07Output
from app.models.state import PipelineState


async def agent_07_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "tech_stack": state.agent_04_output["tech_stack"],
        "folder_structure": state.agent_04_output["folder_structure"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "design_system": state.agent_06_output["design_system"],
        "component_specs": state.agent_06_output["component_specs"],
        "tasks": state.agent_03_output["tasks"],
    }

    result: Agent07Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_07_frontend_senior",
        model="claude-sonnet-5",
        system_prompt=AGENT_07_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent07Output,
        max_tokens=10000,
    )

    await generate_agent_07_artifacts(state.run_id, result)

    return state.model_copy(
        update={
            "agent_07_output": result.model_dump(),
            "current_agent": "agent_07_frontend_senior",
            "status": "running",
        }
    )


async def generate_agent_07_artifacts(run_id: str, output: Agent07Output):
    plan_md = (
        "| Module | Files | Dependencies |\n|---|---|---|\n"
        + "\n".join(
            f"| {m.module_name} | {', '.join(m.files)}"
            f" | {', '.join(m.dependencies) or 'none'} |"
            for m in output.module_plan
        )
    )
    await save_artifact(
        run_id, "agent_07_frontend_senior", "fe_module_plan.md", plan_md
    )

    contracts_md = "\n\n".join(
        f"#### {c.component_name}\n```typescript\n{c.props_interface}\n```"
        for c in output.component_contracts
    )
    await save_artifact(
        run_id, "agent_07_frontend_senior", "fe_component_contracts.md", contracts_md
    )

    b = output.boilerplate_setup
    boilerplate_md = (
        "```bash\n" + "\n".join(b.setup_commands) + "\n```\n\n"
        + "#### Key Dependencies\n"
        + "\n".join(f"- {d}" for d in b.key_dependencies)
        + "\n\n"
        + "#### Config Files\n"
        + "\n".join(f"- {c}" for c in b.config_files)
    )
    await save_artifact(
        run_id, "agent_07_frontend_senior", "fe_boilerplate_setup.md", boilerplate_md
    )

    routes_md = "\n".join(
        f"{r.path} → {r.component}"
        + (
            f" (protected{', ' + r.role_restriction if r.role_restriction else ''})"
            if r.protected
            else ""
        )
        for r in output.routing_structure
    )
    await save_artifact(
        run_id, "agent_07_frontend_senior", "fe_routing_structure.md", routes_md
    )

    s = output.state_strategy
    state_md = (
        f"- Tool: {s.global_state_tool}\n"
        f"- Stores: {', '.join(s.stores)}\n"
        f"- Server state: {s.server_state_tool}\n"
        f"- Form state: {s.form_state_tool}"
    )
    await save_artifact(
        run_id, "agent_07_frontend_senior", "fe_state_strategy.md", state_md
    )
