import json

import pytest

from app.agents import agent_02
from app.agents.agent_02 import (
    agent_02_node,
    complexity_sanity_check,
    generate_agent_02_artifacts,
)
from app.models.agent_02 import ComplexityScore
from app.models.state import PipelineState
from tests.conftest import (
    sample_agent01_output,
    sample_agent02_output,
    sample_validated_form,
    sample_validation_report,
)


def make_state(**overrides):
    base = {
        "run_id": "run_1",
        "organization_id": "org_1",
        "product_idea": "Pet Tracker",
        "onboarding_data": sample_validated_form(),
        "agent_01_output": sample_agent01_output(),
    }
    base.update(overrides)
    return PipelineState(**base)


def test_prompt_references_real_validated_form_fields():
    from app.agents.prompts.agent_02 import AGENT_02_SYSTEM_PROMPT

    assert "must_have_features" in AGENT_02_SYSTEM_PROMPT
    assert "problem_statement" in AGENT_02_SYSTEM_PROMPT
    assert "validation_report" in AGENT_02_SYSTEM_PROMPT
    assert "vague_features_flagged" in AGENT_02_SYSTEM_PROMPT
    assert "project_name, description" not in AGENT_02_SYSTEM_PROMPT
    assert "constraints, budget, timeline" not in AGENT_02_SYSTEM_PROMPT


@pytest.mark.asyncio
async def test_agent_02_node_consumes_validation_report(monkeypatch):
    captured = {}
    state = make_state(
        agent_01_output=sample_agent01_output(
            validation_report=sample_validation_report(
                inconsistencies_found=["platform says API but features are a dashboard"],
                vague_features_flagged=["user management"],
                missing_fields=["team_context"],
            )
        )
    )

    async def fake_run_agent(**kwargs):
        captured["message"] = kwargs["user_message"]
        return sample_agent02_output()

    async def fake_check_quota(org_id, agent_name):
        captured["quota_check"] = agent_name

    async def fake_save_artifact(*args, **kwargs):
        pass

    monkeypatch.setattr(agent_02, "run_agent", fake_run_agent)
    monkeypatch.setattr(agent_02, "check_agent_quota", fake_check_quota)
    monkeypatch.setattr(agent_02, "save_artifact", fake_save_artifact)

    result = await agent_02_node(state)

    message = json.loads(captured["message"])
    assert "validated_form" in message
    assert message["validated_form"]["must_have_features"]
    assert message["validation_report"]["vague_features_flagged"] == ["user management"]
    assert message["validation_report"]["inconsistencies_found"] == [
        "platform says API but features are a dashboard"
    ]
    assert message["validation_report"]["missing_fields"] == ["team_context"]
    assert captured["quota_check"] == "agent_02_requirement_analyst"

    assert result.agent_02_output["complexity_score"]["score"] == "S"
    assert result.current_agent == "agent_02_requirement_analyst"
    assert result.status == "running"


def test_complexity_sanity_check_pass_when_consistent():
    assert complexity_sanity_check(sample_agent02_output()) == []


def test_complexity_sanity_check_flags_overscored():
    output = sample_agent02_output()
    output.complexity_score = ComplexityScore(score="XL", reason="huge")
    output.functional_requirements = output.functional_requirements[:1]
    warnings = complexity_sanity_check(output)
    assert warnings
    assert any("XL" in w and "1 FRs" in w for w in warnings)


def test_complexity_sanity_check_flags_underscored():
    output = sample_agent02_output()
    output.complexity_score = ComplexityScore(score="S", reason="tiny")
    output.functional_requirements = [
        sample_agent02_output().functional_requirements[0] for _ in range(45)
    ]
    warnings = complexity_sanity_check(output)
    assert warnings
    assert any("'S' looks low" in w for w in warnings)


@pytest.mark.asyncio
async def test_generate_agent_02_artifacts_writes_all_files(monkeypatch):
    artifacts = {}

    async def fake_save_artifact(run_id, agent_name, filename, content):
        artifacts[filename] = content

    monkeypatch.setattr(agent_02, "save_artifact", fake_save_artifact)

    await generate_agent_02_artifacts("run_1", sample_agent02_output())

    assert set(artifacts) == {
        "requirements.md",
        "personas.md",
        "user_journeys.md",
        "ambiguities.md",
        "complexity_score.json",
    }
    assert "FR-01" in artifacts["requirements.md"]
    assert "NFR-01" in artifacts["requirements.md"]
    assert "Ana" in artifacts["personas.md"]
    assert "Log a walk" in artifacts["user_journeys.md"]
    assert json.loads(artifacts["complexity_score.json"])["score"] == "S"


@pytest.mark.asyncio
async def test_generate_agent_02_artifacts_writes_complexity_warnings(monkeypatch):
    artifacts = {}

    async def fake_save_artifact(run_id, agent_name, filename, content):
        artifacts[filename] = content

    monkeypatch.setattr(agent_02, "save_artifact", fake_save_artifact)

    output = sample_agent02_output()
    output.complexity_score = ComplexityScore(score="XL", reason="huge")
    await generate_agent_02_artifacts("run_1", output)

    assert "complexity_warnings.md" in artifacts
    assert "XL" in artifacts["complexity_warnings.md"]
