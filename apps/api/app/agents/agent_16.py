import json
from app.agents.base import run_agent
from app.agents.prompts.agent_16 import AGENT_16_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_16 import Agent16Output
from app.models.state import PipelineState


async def agent_16_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "tech_stack": state.agent_04_output["tech_stack"],
        "environment_config": state.agent_04_output["environment_config"],
        "folder_structure": state.agent_04_output["folder_structure"],
        "system_architecture": state.agent_04_output["system_architecture"],
    }

    result: Agent16Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_16_devops",
        model="claude-sonnet-5",
        system_prompt=AGENT_16_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent16Output,
        max_tokens=10000,
    )

    pre_deploy_warnings = _compute_pre_deploy_warnings(state)

    await _generate_agent_16_artifacts(state.run_id, result, pre_deploy_warnings)

    return state.model_copy(update={
        "agent_16_output": {**result.model_dump(), "pre_deploy_warnings": pre_deploy_warnings},
        "current_agent": "agent_16_devops",
        "status": "running",
    })


def _compute_pre_deploy_warnings(state: PipelineState) -> list[str]:
    warnings = []
    fe_gate_result = (state.agent_09_output or {}).get("overall_result")
    be_gate_result = (state.agent_12_output or {}).get("overall_result")
    if fe_gate_result != "PASS":
        warnings.append(
            "Frontend gate did not PASS — proceed with caution or address gaps before deploying."
        )
    if be_gate_result != "PASS":
        warnings.append(
            "Backend gate did not PASS — proceed with caution or address gaps before deploying."
        )
    fix_results = (state.agent_15_output or {}).get("fix_results", [])
    escalated = [r for r in fix_results if r["status"] == "ESCALATED"]
    if escalated:
        ids = ", ".join(r["bug_id"] for r in escalated)
        warnings.append(
            f"{len(escalated)} bug(s) still ESCALATED and unresolved: {ids} — review before deploying."
        )
    v2_backlog = (state.agent_15_output or {}).get("v2_backlog", [])
    if v2_backlog:
        warnings.append(
            f"{len(v2_backlog)} Medium/Low bug(s) deferred to v2 backlog — not blocking, but tracked."
        )
    if not fix_results and not v2_backlog:
        warnings.append(
            "No QA bug data found in pipeline state — confirm Phase 14/15 ran before deploying."
        )
    return warnings


async def _generate_agent_16_artifacts(
    run_id: str, output: Agent16Output, warnings: list[str]
):
    for f in output.dockerfiles:
        await save_artifact(run_id, "agent_16_devops", f.path, f.content)
    await save_artifact(
        run_id, "agent_16_devops", output.docker_compose.path, output.docker_compose.content
    )
    await save_artifact(
        run_id, "agent_16_devops", output.ci_cd_pipeline.path, output.ci_cd_pipeline.content
    )
    for f in output.terraform_files:
        await save_artifact(run_id, "agent_16_devops", f.path, f.content)

    runbook_md = (
        f"#### How to Rollback\n{output.rollback_strategy}\n\n"
        "#### Health Check Endpoints\n"
        + "\n".join(
            f"- {h.service}: {h.endpoint} → `{h.expected_response}`"
            for h in output.health_check_endpoints
        )
    )
    if warnings:
        runbook_md += "\n\n#### Pre-Deploy Warnings\n" + "\n".join(f"- {w}" for w in warnings)
    await save_artifact(run_id, "agent_16_devops", "rollback_runbook.md", runbook_md)
