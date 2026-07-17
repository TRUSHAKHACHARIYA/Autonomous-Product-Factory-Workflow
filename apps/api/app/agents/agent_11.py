import asyncio
import json
from app.agents.base import run_agent
from app.agents.context import get_security_checklist_text
from app.agents.prompts.agent_11 import AGENT_11_SYSTEM_PROMPT_TEMPLATE
from app.agents.artifacts import save_artifact
from app.models.agent_11 import ModuleCodeOutput, Agent11Output
from app.models.state import PipelineState


async def _generate_module(
    state: PipelineState,
    module: dict,
    shared_context: dict,
) -> ModuleCodeOutput:
    system_prompt = AGENT_11_SYSTEM_PROMPT_TEMPLATE.format(
        module_name=module["module_name"],
        security_checklist=get_security_checklist_text(state),
    )
    input_payload = {
        "module": module,
        "middleware_chain": shared_context["middleware_chain"],
        "database_schema_sql": shared_context["database_schema_sql"],
        "api_contracts_yaml": shared_context["api_contracts_yaml"],
        "error_strategy": shared_context["error_strategy"],
        "auth_strategy": shared_context["auth_strategy"],
    }

    return await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name=f"agent_11_backend_junior::{module['module_name']}",
        model="claude-sonnet-5",
        system_prompt=system_prompt,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=ModuleCodeOutput,
        max_tokens=16000,
    )


async def agent_11_node(state: PipelineState) -> PipelineState:
    modules = state.agent_10_output["module_plan"]
    shared_context = {
        "middleware_chain": state.agent_10_output["middleware_chain"],
        "error_strategy": state.agent_10_output["error_strategy"],
        "database_schema_sql": state.agent_04_output["database_schema_sql"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "auth_strategy": state.agent_04_output["auth_strategy"],
    }

    results: list[ModuleCodeOutput] = await asyncio.gather(
        *[_generate_module(state, module, shared_context) for module in modules]
    )

    output = Agent11Output(modules=results)
    await _generate_agent_11_artifacts(state.run_id, output)

    return state.model_copy(
        update={
            "agent_11_output": output.model_dump(),
            "current_agent": "agent_11_backend_junior",
            "status": "running",
        }
    )


async def _generate_agent_11_artifacts(run_id: str, output: Agent11Output):
    for module in output.modules:
        for f in module.files:
            await save_artifact(
                run_id,
                "agent_11_backend_junior",
                f"{module.module_name}/{f.path}",
                f.content,
            )
