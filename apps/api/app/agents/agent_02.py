import json
from app.agents.base import check_agent_quota, run_agent
from app.agents.prompts.agent_02 import AGENT_02_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_02 import Agent02Output
from app.models.state import PipelineState

COMPLEXITY_FR_RANGES = {
    "S": (1, 10),
    "M": (11, 25),
    "L": (26, 40),
    "XL": (41, 1000),
}


def complexity_sanity_check(output: Agent02Output) -> list[str]:
    """Heuristic FR-count vs complexity-score guardrail. Returns warnings only —
    never blocks a run."""
    fr_count = len(output.functional_requirements)
    score = output.complexity_score.score
    low, high = COMPLEXITY_FR_RANGES[score]
    warnings = []
    if fr_count < low:
        warnings.append(
            f"complexity '{score}' looks high for {fr_count} FRs (expected at least {low})"
        )
    if fr_count > high:
        warnings.append(
            f"complexity '{score}' looks low for {fr_count} FRs (expected at most {high})"
        )
    return warnings


async def agent_02_node(state: PipelineState) -> PipelineState:
    await check_agent_quota(state.organization_id, "agent_02_requirement_analyst")

    payload = {
        "validated_form": state.agent_01_output["validated_form"],
        "validation_report": state.agent_01_output.get("validation_report", {}),
    }

    result: Agent02Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_02_requirement_analyst",
        model="claude-sonnet-5",
        system_prompt=AGENT_02_SYSTEM_PROMPT,
        user_message=json.dumps(payload, indent=2),
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

    warnings = complexity_sanity_check(output)
    if warnings:
        await save_artifact(
            run_id,
            "agent_02_requirement_analyst",
            "complexity_warnings.md",
            "## Complexity sanity warnings\n" + "\n".join(f"- {w}" for w in warnings),
        )
