import json
from langgraph.types import interrupt
from app.agents.base import check_agent_quota, run_agent
from app.agents.prompts.agent_01 import AGENT_01_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_01 import Agent01Output
from app.models.state import PipelineState

MAX_CLARIFICATION_ROUNDS = 3


def _build_message(state: PipelineState) -> str:
    payload = {
        "onboarding_form": state.onboarding_data,
        "prior_rounds": state.clarification_history,
    }
    return json.dumps(payload, indent=2)


async def agent_01_node(state: PipelineState) -> PipelineState:
    await check_agent_quota(state.organization_id, "agent_01_input_layer")

    result: Agent01Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name=f"agent_01_input_layer::round_{state.clarification_round}",
        model="claude-haiku-4-5-20251001",
        system_prompt=AGENT_01_SYSTEM_PROMPT,
        user_message=_build_message(state),
        output_schema=Agent01Output,
    )

    output_dict = result.model_dump()
    output_dict["clarification_round"] = state.clarification_round
    output_dict["clarification_history"] = state.clarification_history

    if (
        result.validation_report.overall_readiness == "NEEDS_CLARIFICATION"
        and state.clarification_round < MAX_CLARIFICATION_ROUNDS
    ):
        output_dict["pending_questions"] = result.clarifying_questions
        output_dict["pending_readiness_reason"] = result.validation_report.readiness_reason

        answers: dict = interrupt(
            {
                "type": "clarification",
                "round": state.clarification_round + 1,
                "questions": result.clarifying_questions,
                "readiness_reason": result.validation_report.readiness_reason,
            }
        )
        new_history = state.clarification_history + [
            {
                "round": state.clarification_round + 1,
                "questions": result.clarifying_questions,
                "answers": answers,
            }
        ]
        return state.model_copy(
            update={
                "clarification_history": new_history,
                "clarification_round": state.clarification_round + 1,
                "agent_01_output": output_dict,
            }
        )

    await generate_agent_01_artifacts(state.run_id, result)
    return state.model_copy(
        update={
            "agent_01_output": output_dict,
            "current_agent": "agent_01_input_layer",
            "status": "running",
        }
    )


def route_after_input_layer(state: PipelineState) -> str:
    output = state.agent_01_output
    if output["validation_report"]["overall_readiness"] == "READY":
        return "agent_02_requirement_analyst"
    if state.clarification_round >= MAX_CLARIFICATION_ROUNDS:
        return "agent_02_requirement_analyst"
    return "agent_01_input_layer"


async def generate_agent_01_artifacts(run_id: str, output: Agent01Output):
    await save_artifact(
        run_id,
        "agent_01_input_layer",
        "validated_form.json",
        json.dumps(output.validated_form, indent=2),
    )
    report = output.validation_report
    md = f"""# Validation Report
- Consistency check: {"PASS" if report.consistency_check_passed else "FAIL"}
- Inconsistencies: {", ".join(report.inconsistencies_found) if report.inconsistencies_found else "None"}
- Missing fields: {", ".join(report.missing_fields) if report.missing_fields else "None"}
- Vague features flagged: {", ".join(report.vague_features_flagged) if report.vague_features_flagged else "None"}

**Overall readiness: {report.overall_readiness}**
{report.readiness_reason}
"""
    await save_artifact(run_id, "agent_01_input_layer", "validation_report.md", md)
