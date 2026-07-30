import json
from app.agents.base import run_agent
from app.agents.prompts.agent_17 import AGENT_17_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_17 import Agent17Output
from app.models.state import PipelineState


async def agent_17_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "project_identity": state.agent_01_output["validated_form"],
        "complexity_score": state.agent_02_output["complexity_score"],
        "tech_stack": state.agent_04_output["tech_stack"],
        "system_architecture": state.agent_04_output["system_architecture"],
        "database_schema_sql": state.agent_04_output["database_schema_sql"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "folder_structure": state.agent_04_output["folder_structure"],
        "fe_module_plan": state.agent_07_output["module_plan"],
        "fe_boilerplate_setup": state.agent_07_output["boilerplate_setup"],
        "be_module_plan": state.agent_10_output["module_plan"],
        "be_boilerplate_setup": state.agent_10_output["boilerplate_setup"],
        "rollback_strategy": state.agent_16_output["rollback_strategy"],
        "v2_backlog": (state.agent_15_output or {}).get("v2_backlog", []),
    }

    result: Agent17Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_17_documentation",
        model="claude-haiku-4-5-20251001",
        system_prompt=AGENT_17_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent17Output,
        max_tokens=12000,
    )

    for f in result.docs:
        await save_artifact(state.run_id, "agent_17_documentation", f.path, f.content)

    return state.model_copy(update={
        "agent_17_output": result.model_dump(),
        "current_agent": "agent_17_documentation",
        "status": "running",
    })
