import time
import asyncio
from datetime import datetime, timezone
from typing import Callable
from anthropic import AsyncAnthropic, APIConnectionError, RateLimitError, APIStatusError
from langgraph.func import task
from langgraph.types import interrupt
from pydantic import BaseModel
from app.config import settings
from app.deps import supabase_admin
from app.agents.registry import calculate_cost

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def _call_claude_with_retry(**kwargs):
    last_exc = None
    for attempt in range(3):
        try:
            return await client.messages.create(**kwargs)
        except (RateLimitError, APIConnectionError) as e:
            last_exc = e
            await asyncio.sleep(2 ** attempt)
        except APIStatusError as e:
            if e.status_code >= 500:
                last_exc = e
                await asyncio.sleep(2 ** attempt)
            else:
                raise
    raise last_exc


async def run_agent(
    *,
    run_id: str,
    organization_id: str,
    agent_name: str,
    model: str,
    system_prompt: str,
    user_message: str,
    output_schema: type[BaseModel],
    max_tokens: int = 8000,
    mcp_servers: list[dict] | None = None,
) -> BaseModel:
    supabase_admin.table("agent_outputs").upsert({
        "run_id": run_id, "organization_id": organization_id,
        "agent_name": agent_name, "status": "running",
    }, on_conflict="run_id,agent_name").execute()

    start = time.time()
    try:
        create_kwargs = dict(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
            tools=[{
                "name": "emit_output",
                "description": f"Return {agent_name}'s structured output.",
                "input_schema": output_schema.model_json_schema(),
            }],
            tool_choice={"type": "tool", "name": "emit_output"},
        )

        if mcp_servers:
            response = await client.beta.messages.create(
                **create_kwargs, mcp_servers=mcp_servers, betas=["mcp-client-2025-04-04"],
            )
        else:
            response = await _call_claude_with_retry(**create_kwargs)
        tool_use = next(b for b in response.content if b.type == "tool_use")
        validated = output_schema.model_validate(tool_use.input)

        cost = calculate_cost(model, response.usage.input_tokens, response.usage.output_tokens)
        supabase_admin.table("agent_outputs").update({
            "status": "completed",
            "structured_output": validated.model_dump(),
            "model_used": model,
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
            "cost_usd": cost,
            "duration_ms": int((time.time() - start) * 1000),
        }).eq("run_id", run_id).eq("agent_name", agent_name).eq("organization_id", organization_id).execute()

        return validated

    except Exception as e:
        supabase_admin.table("agent_outputs").update({
            "status": "failed", "error": str(e),
        }).eq("run_id", run_id).eq("agent_name", agent_name).eq("organization_id", organization_id).execute()
        raise


@task
async def run_agent_task(**kwargs):
    """Same as run_agent(), but checkpointed per-call so it's replay-safe inside any
    loop that also calls interrupt(). Use this instead of run_agent() directly
    whenever the call sits in a loop with an interrupt() after it."""
    return await run_agent(**kwargs)


async def run_agent_with_approval(
    *,
    run_id: str,
    organization_id: str,
    agent_name: str,
    model: str,
    system_prompt: str,
    build_message: Callable[[str | None], str],
    output_schema: type[BaseModel],
    max_tokens: int = 8000,
    max_revisions: int = 3,
    mcp_servers: list[dict] | None = None,
) -> BaseModel:
    revision_notes: str | None = None
    result: BaseModel | None = None

    for attempt in range(1, max_revisions + 1):
        result = await run_agent_task(
            run_id=run_id,
            organization_id=organization_id,
            agent_name=agent_name,
            model=model,
            system_prompt=system_prompt,
            user_message=build_message(revision_notes),
            output_schema=output_schema,
            max_tokens=max_tokens,
            mcp_servers=mcp_servers,
        )

        supabase_admin.table("approval_gates").insert(
            {
                "run_id": run_id,
                "organization_id": organization_id,
                "agent_name": agent_name,
                "attempt": attempt,
                "status": "pending",
            },
        ).execute()

        decision: dict = interrupt(
            {
                "type": "approval",
                "agent_name": agent_name,
                "attempt": attempt,
                "output": result.model_dump(),
            }
        )

        action = decision.get("action")
        supabase_admin.table("approval_gates").update(
            {
                "status": {
                    "approve": "approved",
                    "edit": "edited",
                    "reject": "rejected",
                }[action],
                "reviewer_notes": decision.get("notes"),
                "resolved_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("run_id", run_id).eq("agent_name", agent_name).eq("attempt", attempt).execute()

        if action == "approve":
            break
        elif action == "edit":
            result = output_schema.model_validate(decision["edited_output"])
            break
        elif action == "reject":
            revision_notes = decision.get("notes", "")
            if attempt == max_revisions:
                break
            continue

    return result
