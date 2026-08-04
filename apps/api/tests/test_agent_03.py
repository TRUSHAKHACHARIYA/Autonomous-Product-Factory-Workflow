import copy
import json

import pytest
from pydantic import ValidationError

from app.agents import agent_03, base
from app.agents.agent_03 import agent_03_node
from app.agents.base import PlanRequiredError, run_agent
from app.models.agent_03 import Agent03Output, SprintPlan, Task
from app.models.state import PipelineState
from tests.conftest import (
    FakeSupabase,
    make_response,
    sample_agent02_output,
    sample_agent03_output,
)


def make_state(**overrides):
    data = {
        "run_id": "run_1",
        "organization_id": "org_1",
        "product_idea": "Pet Tracker",
        "agent_01_output": {
            "validated_form": {"project_name": "Pet Tracker", "platform": "Mobile"},
            "validation_report": {"consistency_check_passed": True},
        },
        "agent_02_output": sample_agent02_output().model_dump(),
    }
    data.update(overrides)
    return PipelineState(**data)


# ---------------------------------------------------------- model validation


def test_sample_agent03_output_is_valid():
    assert isinstance(sample_agent03_output(), Agent03Output)


def test_rejects_dangling_epic_task():
    data = sample_agent03_output().model_dump()
    data["epics"][0]["task_ids"] = ["T-01", "T-99"]
    with pytest.raises(ValidationError, match="references unknown task"):
        Agent03Output.model_validate(data)


def test_rejects_dangling_depends_on():
    data = sample_agent03_output().model_dump()
    data["tasks"][0]["depends_on"] = ["T-NOPE"]
    with pytest.raises(ValidationError, match="depends_on unknown task"):
        Agent03Output.model_validate(data)


def test_rejects_unknown_sprint_task():
    data = sample_agent03_output().model_dump()
    data["sprint_plan"][0]["task_ids"] = ["T-01", "T-99"]
    with pytest.raises(ValidationError, match="references unknown task"):
        Agent03Output.model_validate(data)


def test_rejects_circular_dependency():
    data = sample_agent03_output().model_dump()
    data["tasks"] = [
        {"id": "T-01", "epic_id": "EP-01", "title": "A", "points": 3, "sprint": 1, "depends_on": ["T-02"]},
        {"id": "T-02", "epic_id": "EP-01", "title": "B", "points": 3, "sprint": 1, "depends_on": ["T-01"]},
    ]
    data["epics"][0]["task_ids"] = ["T-01", "T-02"]
    data["sprint_plan"] = [SprintPlan(sprint=1, task_ids=["T-01", "T-02"], total_points=6).model_dump()]
    with pytest.raises(ValidationError, match="Circular dependency"):
        Agent03Output.model_validate(data)


def test_rejects_self_dependency():
    data = sample_agent03_output().model_dump()
    data["tasks"][0]["depends_on"] = ["T-01"]
    with pytest.raises(ValidationError, match="Circular dependency"):
        Agent03Output.model_validate(data)


def test_rejects_transitive_cycle():
    data = sample_agent03_output().model_dump()
    data["tasks"] = [
        {"id": "T-01", "epic_id": "EP-01", "title": "A", "points": 1, "sprint": 1, "depends_on": ["T-02"]},
        {"id": "T-02", "epic_id": "EP-01", "title": "B", "points": 1, "sprint": 1, "depends_on": ["T-03"]},
        {"id": "T-03", "epic_id": "EP-01", "title": "C", "points": 1, "sprint": 1, "depends_on": ["T-01"]},
    ]
    data["epics"][0]["task_ids"] = ["T-01", "T-02", "T-03"]
    data["sprint_plan"] = [
        SprintPlan(sprint=1, task_ids=["T-01", "T-02", "T-03"], total_points=3).model_dump()
    ]
    with pytest.raises(ValidationError, match="Circular dependency"):
        Agent03Output.model_validate(data)


def test_total_points_auto_corrected_on_mismatch():
    data = sample_agent03_output().model_dump()
    data["sprint_plan"][0]["total_points"] = 999
    output = Agent03Output.model_validate(data)
    assert output.sprint_plan[0].total_points == 8


def test_total_points_reflects_task_points():
    output = sample_agent03_output()
    output.tasks.append(Task(id="T-03", epic_id="EP-01", title="Extra", points=13, sprint=1, depends_on=[]))
    output.epics[0].task_ids.append("T-03")
    output.sprint_plan[0].task_ids.append("T-03")
    output = Agent03Output.model_validate(output.model_dump())
    assert output.sprint_plan[0].total_points == 21


def test_rejects_risk_with_unknown_related_epic():
    data = sample_agent03_output().model_dump()
    data["risk_register"][0]["related_epic_id"] = "EP-NOPE"
    with pytest.raises(ValidationError, match="unknown epic"):
        Agent03Output.model_validate(data)


def test_accepts_risk_with_valid_related_epic():
    data = sample_agent03_output().model_dump()
    data["risk_register"][0]["related_epic_id"] = "EP-01"
    assert Agent03Output.model_validate(data).risk_register[0].related_epic_id == "EP-01"


# ------------------------------------------------------------- node behavior


@pytest.mark.asyncio
async def test_agent_03_node_passes_journeys_and_ambiguities(monkeypatch):
    captured = {}

    async def fake_run_agent(**kwargs):
        captured["message"] = kwargs["user_message"]
        return sample_agent03_output()

    async def fake_check_quota(org_id, agent_name):
        captured["quota_check"] = agent_name

    async def fake_save_artifact(*args, **kwargs):
        pass

    monkeypatch.setattr(agent_03, "run_agent", fake_run_agent)
    monkeypatch.setattr(agent_03, "check_agent_quota", fake_check_quota)
    monkeypatch.setattr(agent_03, "save_artifact", fake_save_artifact)

    result = await agent_03_node(make_state())

    message = json.loads(captured["message"])
    assert len(message["user_journeys"]) == 3
    assert message["user_journeys"][0]["name"] == "Log a walk"
    assert message["ambiguities"] == []
    assert message["functional_requirements"][0]["id"] == "FR-01"
    assert captured["quota_check"] == "agent_03_project_manager"

    assert result.agent_03_output["epics"][0]["id"] == "EP-01"
    assert result.current_agent == "agent_03_project_manager"
    assert result.status == "running"


@pytest.mark.asyncio
async def test_agent_03_node_calls_quota_check(monkeypatch):
    captured = []

    async def fake_run_agent(**kwargs):
        return sample_agent03_output()

    async def fake_check_quota(org_id, agent_name):
        captured.append((org_id, agent_name))

    async def fake_save_artifact(*args, **kwargs):
        pass

    monkeypatch.setattr(agent_03, "run_agent", fake_run_agent)
    monkeypatch.setattr(agent_03, "check_agent_quota", fake_check_quota)
    monkeypatch.setattr(agent_03, "save_artifact", fake_save_artifact)

    await agent_03_node(make_state())

    assert captured == [("org_1", "agent_03_project_manager")]


@pytest.mark.asyncio
async def test_agent_03_node_persists_awaiting_upgrade_when_blocked(monkeypatch):
    async def fake_run_agent(**kwargs):
        return sample_agent03_output()

    async def fake_check_quota(org_id, agent_name):
        raise PlanRequiredError("plan_required")

    async def fake_save_artifact(*args, **kwargs):
        pass

    monkeypatch.setattr(agent_03, "run_agent", fake_run_agent)
    monkeypatch.setattr(agent_03, "check_agent_quota", fake_check_quota)
    monkeypatch.setattr(agent_03, "save_artifact", fake_save_artifact)

    with pytest.raises(PlanRequiredError):
        await agent_03_node(make_state())


# ------------------------------------------------------- schema-retry path


def run_agent_kwargs():
    return dict(
        run_id="run_1",
        organization_id="org_1",
        agent_name="agent_03_project_manager",
        model="claude-sonnet-5",
        system_prompt="sys",
        user_message="msg",
        output_schema=Agent03Output,
        max_tokens=12000,
    )


@pytest.mark.asyncio
async def test_schema_retry_engages_on_dangling_reference(monkeypatch):
    valid = sample_agent03_output().model_dump()
    dangling = copy.deepcopy(valid)
    dangling["tasks"][0]["depends_on"] = ["T-NOPE"]
    dangling["sprint_plan"][0]["total_points"] = 999

    responses = [make_response(dangling), make_response(valid)]
    calls = []

    async def fake_call(**kwargs):
        calls.append(kwargs)
        return responses[len(calls) - 1]

    monkeypatch.setattr(base, "_call_claude_with_retry", fake_call)
    monkeypatch.setattr(base, "supabase_admin", FakeSupabase())

    result = await run_agent(**run_agent_kwargs())

    assert isinstance(result, Agent03Output)
    assert result.sprint_plan[0].total_points == 8
    assert len(calls) == 2
    assert "Validation errors" in calls[1]["messages"][2]["content"]
    assert "depends_on unknown task" in calls[1]["messages"][2]["content"]


# ----------------------------------------------------------- artifacts


@pytest.mark.asyncio
async def test_generate_agent_03_artifacts_writes_all_files(monkeypatch):
    artifacts = {}

    async def fake_save_artifact(run_id, agent_name, filename, content):
        artifacts[filename] = content

    monkeypatch.setattr(agent_03, "save_artifact", fake_save_artifact)

    await agent_03.generate_agent_03_artifacts("run_1", sample_agent03_output())

    assert set(artifacts) == {
        "epics.md",
        "tasks.json",
        "mvp_scope.md",
        "timeline.md",
        "acceptance_criteria.md",
        "risk_register.md",
        "sprint_plan.md",
    }
    assert "Epic 1: Walks" in artifacts["epics.md"]
    assert "log walks so I can track" in artifacts["epics.md"]
    tasks = json.loads(artifacts["tasks.json"])
    assert tasks[0]["id"] == "T-01"
    assert "walk logging" in artifacts["mvp_scope.md"]
    assert "Sprint 1" in artifacts["sprint_plan.md"]
    assert "8 points" in artifacts["sprint_plan.md"]


# --------------------------------------------------------------- prompt


def test_prompt_mentions_journeys_and_ambiguities():
    from app.agents.prompts.agent_03 import AGENT_03_SYSTEM_PROMPT

    assert "user journeys" in AGENT_03_SYSTEM_PROMPT
    assert "ambiguities" in AGENT_03_SYSTEM_PROMPT
    assert "end-to-end" in AGENT_03_SYSTEM_PROMPT
    assert "intentionally deferred" in AGENT_03_SYSTEM_PROMPT
    assert "Never silently break a core journey" in AGENT_03_SYSTEM_PROMPT
    assert "related_epic_id" in AGENT_03_SYSTEM_PROMPT
    assert "sprint" in AGENT_03_SYSTEM_PROMPT
