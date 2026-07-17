import json
from app.agents.base import run_agent
from app.agents.prompts.agent_02 import AGENT_02_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_02 import Agent02Output
from app.models.state import PipelineState


async def agent_02_node(state: PipelineState) -> PipelineState:
    user_input = state.agent_01_output["user_input"]

    result: Agent02Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_02_requirement_analyst",
        model="claude-sonnet-5",
        system_prompt=AGENT_02_SYSTEM_PROMPT,
        user_message=json.dumps(user_input, indent=2),
        output_schema=Agent02Output,
    )

    await generate_agent_02_artifacts(state.run_id, result)

    return state.model_copy(update={
        "agent_02_output": result.model_dump(),
        "current_agent": "agent_02_requirement_analyst",
        "status": "running",
    })


async def generate_agent_02_artifacts(run_id: str, output: Agent02Output):
    fr_md = "#### Functional Requirements\n" + "\n".join(
        f"- {fr.id}: {fr.description}" for fr in output.functional_requirements
    )
    nfr_md = "\n\n#### Non-Functional Requirements\n" + "\n".join(
        f"- {n.id}: {n.category} — {n.description}" for n in output.non_functional_requirements
    )
    await save_artifact(run_id, "agent_02_requirement_analyst", "requirements.md", fr_md + nfr_md)

    personas_md = "\n\n".join(
        f"#### Persona {i+1}: {p.name} — {p.role}\n"
        f"- Goal: {p.goal}\n- Pain point: {p.pain_point}\n- Tech comfort: {p.tech_comfort}"
        for i, p in enumerate(output.personas)
    )
    await save_artifact(run_id, "agent_02_requirement_analyst", "personas.md", personas_md)

    journeys_md = "\n\n".join(
        f"#### Journey {i+1}: {j.name}\n" + " → ".join(j.steps)
        for i, j in enumerate(output.user_journeys)
    )
    await save_artifact(run_id, "agent_02_requirement_analyst", "user_journeys.md", journeys_md)

    ambiguities_md = "\n".join(
        f"- Ambiguity: {a.ambiguity} → Resolution: {a.resolution}" for a in output.ambiguities
    ) or "No unresolved ambiguities."
    await save_artifact(run_id, "agent_02_requirement_analyst", "ambiguities.md", ambiguities_md)

    await save_artifact(run_id, "agent_02_requirement_analyst", "complexity_score.json",
                         json.dumps(output.complexity_score.model_dump(), indent=2))
