import json
from app.agents.base import run_agent
from app.agents.prompts.agent_03 import AGENT_03_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_03 import Agent03Output
from app.models.state import PipelineState


async def agent_03_node(state: PipelineState) -> PipelineState:
    agent_02 = state.agent_02_output
    input_payload = {
        "functional_requirements": agent_02["functional_requirements"],
        "non_functional_requirements": agent_02["non_functional_requirements"],
        "personas": agent_02["personas"],
        "complexity_score": agent_02["complexity_score"],
    }

    result: Agent03Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_03_project_manager",
        model="claude-sonnet-5",
        system_prompt=AGENT_03_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent03Output,
        max_tokens=12000,
    )

    await generate_agent_03_artifacts(state.run_id, result)

    return state.model_copy(update={
        "agent_03_output": result.model_dump(),
        "current_agent": "agent_03_project_manager",
        "status": "running",
    })


async def generate_agent_03_artifacts(run_id: str, output: Agent03Output):
    epics_md = "\n\n".join(
        f"#### Epic {i+1}: {e.name}\n"
        f"- User Story: {e.user_story}\n"
        f"- Tasks: {', '.join(e.task_ids)}\n"
        f"- Story Points: {e.story_points}\n- Sprint: {e.sprint}"
        for i, e in enumerate(output.epics)
    )
    await save_artifact(run_id, "agent_03_project_manager", "epics.md", epics_md)

    tasks_json = [t.model_dump() for t in output.tasks]
    await save_artifact(run_id, "agent_03_project_manager", "tasks.json", json.dumps(tasks_json, indent=2))

    mvp_md = (
        "#### In MVP\n" + "\n".join(f"- {f}" for f in output.mvp_scope.in_mvp)
        + "\n\n#### In V2\n" + "\n".join(f"- {f}" for f in output.mvp_scope.in_v2)
    )
    await save_artifact(run_id, "agent_03_project_manager", "mvp_scope.md", mvp_md)

    timeline_md = "| Milestone | Sprint | Deliverable |\n|---|---|---|\n" + "\n".join(
        f"| {m.milestone} | {m.sprint} | {m.deliverable} |" for m in output.timeline
    )
    await save_artifact(run_id, "agent_03_project_manager", "timeline.md", timeline_md)

    ac_md = "\n\n".join(
        f"#### {ac.epic_id}\n" + "\n".join(f"- {c}" for c in ac.criteria)
        for ac in output.acceptance_criteria
    )
    await save_artifact(run_id, "agent_03_project_manager", "acceptance_criteria.md", ac_md)

    risk_md = "| Risk | Probability | Impact | Mitigation |\n|---|---|---|---|\n" + "\n".join(
        f"| {r.risk} | {r.probability} | {r.impact} | {r.mitigation} |" for r in output.risk_register
    )
    await save_artifact(run_id, "agent_03_project_manager", "risk_register.md", risk_md)

    sprint_md = "\n\n".join(
        f"#### Sprint {s.sprint}\n- {', '.join(s.task_ids)} — Total: {s.total_points} points"
        for s in output.sprint_plan
    )
    await save_artifact(run_id, "agent_03_project_manager", "sprint_plan.md", sprint_md)
