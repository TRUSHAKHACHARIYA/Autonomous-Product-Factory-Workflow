from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from arq import create_pool
from arq.connections import RedisSettings
from langgraph.types import Command
from app.config import settings
from app.deps import get_current_org, get_current_user, supabase_admin
from app.graph.pipeline import get_compiled_graph
from app.models.agent_04 import ApprovalDecision
from app.billing.quota import check_run_quota, check_concurrent_runs, increment_run_usage
from app.audit import log_audit_event
from app.rate_limit import limiter
from app.logging import log

router = APIRouter(prefix="/runs", tags=["runs"])


class CreateRunRequest(BaseModel):
    product_idea: str


async def get_redis_pool():
    return await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))


@router.post("")
@limiter.limit("10/minute")
async def create_run(
    request,
    body: CreateRunRequest,
    org_id: str = Depends(get_current_org),
    user=Depends(get_current_user),
):
    await check_run_quota(org_id)
    await check_concurrent_runs(org_id)

    run_id = str(uuid4())
    thread_id = str(uuid4())
    supabase_admin.table("pipeline_runs").insert({
        "id": run_id,
        "organization_id": org_id,
        "created_by": user["id"],
        "product_idea": body.product_idea,
        "langgraph_thread_id": thread_id,
    }).execute()

    pool = await get_redis_pool()
    await pool.enqueue_job("execute_run", run_id)

    await increment_run_usage(org_id)
    await log_audit_event(org_id, user["id"], "run_created", {"run_id": run_id})
    log.info("run.created", run_id=run_id, org_id=org_id, user_id=user["id"])
    return {"run_id": run_id}


@router.get("/{run_id}")
async def get_run(run_id: str, org_id: str = Depends(get_current_org)):
    run = (
        supabase_admin.table("pipeline_runs")
        .select("*")
        .eq("id", run_id)
        .eq("organization_id", org_id)
        .single()
        .execute()
    )
    outputs = (
        supabase_admin.table("agent_outputs")
        .select("*")
        .eq("run_id", run_id)
        .execute()
    )
    return {"run": run.data, "agents": outputs.data}


@router.get("/{run_id}/stream")
async def stream_run(run_id: str):
    from sse_starlette.sse import EventSourceResponse
    import asyncio
    import json

    async def event_generator():
        last_agents = {}
        while True:
            run = supabase_admin.table("pipeline_runs").select("status").eq("id", run_id).single().execute()
            if run.data["status"] in ("completed", "failed"):
                yield {"event": "agent_update", "data": json.dumps({"run_status": run.data["status"]})}
                break

            outputs = supabase_admin.table("agent_outputs").select(
                "agent_name, status, structured_output, model_used, duration_ms"
            ).eq("run_id", run_id).execute()

            for agent in outputs.data:
                key = agent["agent_name"]
                if key not in last_agents or last_agents[key]["status"] != agent["status"]:
                    last_agents[key] = agent
                    yield {"event": "agent_update", "data": json.dumps(agent)}

            await asyncio.sleep(2)

    return EventSourceResponse(event_generator())


@router.post("/{run_id}/clarify")
async def submit_clarification(
    run_id: str,
    answers: dict[str, str],
    org_id: str = Depends(get_current_org),
    user=Depends(get_current_user),
):
    run = (
        supabase_admin.table("pipeline_runs")
        .select("langgraph_thread_id")
        .eq("id", run_id)
        .eq("organization_id", org_id)
        .single()
        .execute()
    )
    if not run.data:
        raise HTTPException(404, "Run not found")

    thread_id = run.data["langgraph_thread_id"]
    graph = get_compiled_graph()
    await graph.ainvoke(
        Command(resume=answers),
        config={"configurable": {"thread_id": thread_id}},
    )

    supabase_admin.table("pipeline_runs").update(
        {"status": "running"}
    ).eq("id", run_id).execute()

    await log_audit_event(org_id, user["id"], "clarification_submitted", {"run_id": run_id})

    return {"status": "resumed"}


@router.post("/{run_id}/approve")
async def submit_approval(
    run_id: str,
    decision: ApprovalDecision,
    org_id: str = Depends(get_current_org),
    user=Depends(get_current_user),
):
    run = (
        supabase_admin.table("pipeline_runs")
        .select("langgraph_thread_id")
        .eq("id", run_id)
        .eq("organization_id", org_id)
        .single()
        .execute()
    )
    if not run.data:
        raise HTTPException(404, "Run not found")

    thread_id = run.data["langgraph_thread_id"]
    graph = get_compiled_graph()
    await graph.ainvoke(
        Command(resume=decision.model_dump()),
        config={"configurable": {"thread_id": thread_id}},
    )

    supabase_admin.table("pipeline_runs").update(
        {"status": "running"}
    ).eq("id", run_id).execute()

    await log_audit_event(org_id, user["id"], "approval_submitted", {
        "run_id": run_id,
        "decision": decision.action,
    })

    return {"status": "resumed"}
