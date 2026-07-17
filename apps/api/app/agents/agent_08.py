import asyncio
import json
from app.agents.base import run_agent
from app.agents.context import get_security_checklist_text
from app.agents.prompts.agent_08 import AGENT_08_SYSTEM_PROMPT_TEMPLATE
from app.agents.artifacts import save_artifact
from app.models.agent_08 import ModuleCodeOutput, Agent08Output
from app.models.state import PipelineState


async def _generate_module(
    state: PipelineState,
    module: dict,
    shared_context: dict,
) -> ModuleCodeOutput:
    system_prompt = AGENT_08_SYSTEM_PROMPT_TEMPLATE.format(
        module_name=module["module_name"],
        security_checklist=get_security_checklist_text(state),
    )
    input_payload = {
        "module": module,
        "component_contracts": shared_context["component_contracts"],
        "design_system": shared_context["design_system"],
        "api_contracts_yaml": shared_context["api_contracts_yaml"],
    }

    return await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name=f"agent_08_frontend_junior::{module['module_name']}",
        model="claude-sonnet-5",
        system_prompt=system_prompt,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=ModuleCodeOutput,
        max_tokens=16000,
    )


async def agent_08_node(state: PipelineState) -> PipelineState:
    modules = state.agent_07_output["module_plan"]
    shared_context = {
        "component_contracts": state.agent_07_output["component_contracts"],
        "design_system": state.agent_06_output["design_system"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
    }

    results: list[ModuleCodeOutput] = await asyncio.gather(
        *[_generate_module(state, module, shared_context) for module in modules]
    )

    output = Agent08Output(modules=results)
    await _generate_agent_08_artifacts(state.run_id, output)

    return state.model_copy(
        update={
            "agent_08_output": output.model_dump(),
            "current_agent": "agent_08_frontend_junior",
            "status": "running",
        }
    )


async def _generate_agent_08_artifacts(run_id: str, output: Agent08Output):
    for module in output.modules:
        for f in module.files:
            await save_artifact(
                run_id,
                "agent_08_frontend_junior",
                f"{module.module_name}/{f.path}",
                f.content,
            )
