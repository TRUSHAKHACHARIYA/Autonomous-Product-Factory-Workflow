import json

import pytest

from app.agents import agent_01
from app.agents.agent_01 import (
    _build_message,
    agent_01_node,
    generate_agent_01_artifacts,
    route_after_input_layer,
)
from app.models.agent_01 import Agent01Output, ValidationReport
from app.models.state import PipelineState


def make_output(
    overall_readiness="READY",
    consistency=True,
    inconsistencies=None,
    missing=None,
    vague=None,
    questions=None,
):
    return Agent01Output(
        validated_form={"project_name": "Sample App", "platform": "Web"},
        validation_report=ValidationReport(
            consistency_check_passed=consistency,
            inconsistencies_found=inconsistencies or [],
            missing_fields=missing or [],
            vague_features_flagged=vague or [],
            overall_readiness=overall_readiness,
            readiness_reason="some reason",
        ),
        clarifying_questions=questions or [],
    )


def make_state(round_=0, history=None, output=None):
    return PipelineState(
        run_id="run_1",
        organization_id="org_1",
        product_idea="Sample App",
        onboarding_data={"project_name": "Sample App", "platform": "Web"},
        clarification_round=round_,
        clarification_history=history or [],
        agent_01_output=output,
    )


def test_build_message_includes_onboarding_and_history():
    state = make_state(
        round_=1,
        history=[{"round": 1, "questions": ["q?"], "answers": {"q?": "a"}}],
    )
    payload = json.loads(_build_message(state))
    assert payload["onboarding_form"] == state.onboarding_data
    assert payload["prior_rounds"] == state.clarification_history


def test_route_readies_to_agent_02():
    state = make_state(output={"validation_report": {"overall_readiness": "READY"}})
    assert route_after_input_layer(state) == "agent_02_requirement_analyst"


def test_route_needs_clarification_loops_back():
    state = make_state(
        round_=0,
        output={"validation_report": {"overall_readiness": "NEEDS_CLARIFICATION"}},
    )
    assert route_after_input_layer(state) == "agent_01_input_layer"


def test_route_forces_through_after_max_rounds():
    state = make_state(
        round_=3,
        output={"validation_report": {"overall_readiness": "NEEDS_CLARIFICATION"}},
    )
    assert route_after_input_layer(state) == "agent_02_requirement_analyst"


@pytest.mark.asyncio
async def test_agent_01_node_ready_generates_artifacts(monkeypatch):
    output = make_output("READY", vague=["user management"])
    artifacts = {}

    async def fake_run_agent(**kwargs):
        return output

    async def fake_save_artifact(run_id, agent_name, filename, content):
        artifacts[filename] = content

    async def fake_check_quota(org_id, agent_name):
        pass

    monkeypatch.setattr(agent_01, "run_agent", fake_run_agent)
    monkeypatch.setattr(agent_01, "save_artifact", fake_save_artifact)
    monkeypatch.setattr(agent_01, "check_agent_quota", fake_check_quota)

    state = make_state()
    result = await agent_01_node(state)

    assert result.current_agent == "agent_01_input_layer"
    assert result.status == "running"
    assert result.agent_01_output["clarification_round"] == 0
    assert result.agent_01_output["validation_report"]["overall_readiness"] == "READY"
    assert "pending_questions" not in result.agent_01_output
    assert "validated_form.json" in artifacts
    assert "validation_report.md" in artifacts
    assert "user management" in artifacts["validation_report.md"]


@pytest.mark.asyncio
async def test_agent_01_node_clarification_interrupts(monkeypatch):
    question = "What does user management include?"
    output = make_output(
        "NEEDS_CLARIFICATION",
        vague=["user management"],
        questions=[question],
    )
    answers = {question: "signup, login, profile"}
    seen = {}

    async def fake_run_agent(**kwargs):
        return output

    async def fake_save_artifact(*args, **kwargs):
        raise AssertionError("no artifacts while awaiting clarification")

    def fake_interrupt(payload):
        seen["payload"] = payload
        return answers

    async def fake_check_quota(org_id, agent_name):
        pass

    monkeypatch.setattr(agent_01, "run_agent", fake_run_agent)
    monkeypatch.setattr(agent_01, "interrupt", fake_interrupt)
    monkeypatch.setattr(agent_01, "save_artifact", fake_save_artifact)
    monkeypatch.setattr(agent_01, "check_agent_quota", fake_check_quota)

    state = make_state()
    result = await agent_01_node(state)

    assert seen["payload"]["type"] == "clarification"
    assert seen["payload"]["round"] == 1
    assert seen["payload"]["questions"] == [question]
    assert result.clarification_round == 1
    assert len(result.clarification_history) == 1
    assert result.clarification_history[0]["answers"] == answers
    assert result.clarification_history[0]["questions"] == [question]
    assert result.agent_01_output["pending_questions"] == [question]
    assert result.agent_01_output["pending_readiness_reason"] == "some reason"


@pytest.mark.asyncio
async def test_generate_agent_01_artifacts_reports_missing_fields(monkeypatch):
    output = make_output(
        "NEEDS_CLARIFICATION",
        consistency=False,
        inconsistencies=["platform mismatch"],
        missing=["tech_preferences"],
        vague=["user management"],
    )
    artifacts = {}

    async def fake_save_artifact(run_id, agent_name, filename, content):
        artifacts[filename] = content

    monkeypatch.setattr(agent_01, "save_artifact", fake_save_artifact)

    await generate_agent_01_artifacts("run_1", output)

    md = artifacts["validation_report.md"]
    assert "FAIL" in md
    assert "platform mismatch" in md
    assert "tech_preferences" in md
    assert "user management" in md
    assert "NEEDS_CLARIFICATION" in md

    form = json.loads(artifacts["validated_form.json"])
    assert form == output.validated_form


def test_validation_report_roundtrips_missing_fields():
    report = ValidationReport(
        consistency_check_passed=True,
        overall_readiness="READY",
        missing_fields=["tech_preferences"],
    )
    assert report.missing_fields == ["tech_preferences"]
    assert report.model_dump()["missing_fields"] == ["tech_preferences"]
    assert report.model_dump()["vague_features_flagged"] == []
