import pytest
from pydantic import ValidationError

from app.agents import base
from app.agents.base import MAX_SCHEMA_REPAIR_ATTEMPTS, PlanRequiredError, run_agent
from app.models.agent_01 import Agent01Output
from tests.conftest import FakeQuery, FakeSupabase, make_response
from types import SimpleNamespace


VALID_OUTPUT = {
    "validated_form": {"project_name": "Sample App", "platform": "Web"},
    "validation_report": {
        "consistency_check_passed": True,
        "overall_readiness": "READY",
        "readiness_reason": "ok",
    },
}

INVALID_OUTPUT = {
    "validated_form": {"project_name": "Sample App", "platform": "Web"},
    "validation_report": {"consistency_check_passed": "not-a-bool"},
}


def run_agent_kwargs():
    return dict(
        run_id="run_1",
        organization_id="org_1",
        agent_name="agent_01_input_layer::round_0",
        model="claude-haiku-4-5-20251001",
        system_prompt="sys",
        user_message="msg",
        output_schema=Agent01Output,
    )


@pytest.mark.asyncio
async def test_run_agent_repairs_invalid_schema_and_retries(monkeypatch):
    responses = [make_response(INVALID_OUTPUT), make_response(VALID_OUTPUT)]
    calls = []

    async def fake_call(**kwargs):
        calls.append(kwargs)
        return responses[len(calls) - 1]

    monkeypatch.setattr(base, "_call_claude_with_retry", fake_call)
    fake_supabase = FakeSupabase()
    monkeypatch.setattr(base, "supabase_admin", fake_supabase)

    result = await run_agent(**run_agent_kwargs())

    assert isinstance(result, Agent01Output)
    assert result.validation_report.overall_readiness == "READY"
    assert len(calls) == 2
    assert len(calls[1]["messages"]) == 3
    assert calls[1]["messages"][1]["role"] == "assistant"
    assert calls[1]["messages"][2]["role"] == "user"
    assert "Validation errors" in calls[1]["messages"][2]["content"]

    updates = [u for op, u in fake_supabase.queries["agent_outputs"].updates if op == "update"]
    completed = updates[-1]
    assert completed["status"] == "completed"
    assert completed["input_tokens"] == 20
    assert completed["output_tokens"] == 40
    assert completed["cost_usd"] == round(0.00022, 4)


@pytest.mark.asyncio
async def test_run_agent_raises_after_repair_exhausted(monkeypatch):
    responses = [make_response(INVALID_OUTPUT), make_response(INVALID_OUTPUT)]
    calls = []

    async def fake_call(**kwargs):
        calls.append(kwargs)
        return responses[len(calls) - 1]

    monkeypatch.setattr(base, "_call_claude_with_retry", fake_call)
    fake_supabase = FakeSupabase()
    monkeypatch.setattr(base, "supabase_admin", fake_supabase)

    with pytest.raises(ValidationError):
        await run_agent(**run_agent_kwargs())

    assert len(calls) == MAX_SCHEMA_REPAIR_ATTEMPTS + 1

    updates = [u for op, u in fake_supabase.queries["agent_outputs"].updates if op == "update"]
    failed = updates[-1]
    assert failed["status"] == "failed"
    assert "validation" in failed["error"].lower()


@pytest.mark.asyncio
async def test_run_agent_single_valid_call_no_repair(monkeypatch):
    responses = [make_response(VALID_OUTPUT)]
    calls = []

    async def fake_call(**kwargs):
        calls.append(kwargs)
        return responses[len(calls) - 1]

    monkeypatch.setattr(base, "_call_claude_with_retry", fake_call)
    monkeypatch.setattr(base, "supabase_admin", FakeSupabase())

    result = await run_agent(**run_agent_kwargs())

    assert isinstance(result, Agent01Output)
    assert len(calls) == 1
    assert len(calls[0]["messages"]) == 1


def _supabase_with_plan(plan):
    calls = {"organizations": 0}

    class OrgQuery(FakeQuery):
        def execute(self):
            calls["organizations"] += 1
            return SimpleNamespace(data={"plan": plan}, count=0)

    def table(name):
        if name == "organizations":
            return OrgQuery()
        return FakeQuery()

    return SimpleNamespace(table=table), calls


@pytest.mark.asyncio
async def test_check_agent_quota_blocks_paid_tier_on_free_plan(monkeypatch):
    supabase, calls = _supabase_with_plan("free")
    monkeypatch.setattr(base, "supabase_admin", supabase)
    with pytest.raises(PlanRequiredError):
        await base.check_agent_quota("org_1", "agent_02_requirement_analyst")
    assert calls["organizations"] == 1


@pytest.mark.asyncio
async def test_check_agent_quota_allows_paid_tier_on_pro_plan(monkeypatch):
    supabase, calls = _supabase_with_plan("pro")
    monkeypatch.setattr(base, "supabase_admin", supabase)
    await base.check_agent_quota("org_1", "agent_02_requirement_analyst")
    assert calls["organizations"] == 1


@pytest.mark.asyncio
async def test_check_agent_quota_skips_cheap_agents_without_db(monkeypatch):
    supabase, calls = _supabase_with_plan("free")
    monkeypatch.setattr(base, "supabase_admin", supabase)
    await base.check_agent_quota("org_1", "agent_01_input_layer")
    assert calls["organizations"] == 0
