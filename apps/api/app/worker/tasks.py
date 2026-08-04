import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from arq import cron
from arq.connections import RedisSettings
from app.config import settings
from app.deps import supabase_admin
from app.models.state import PipelineState
from app.graph.pipeline import get_compiled_graph, init_graph
from app.agents.base import PlanRequiredError
from app.logging import log

SANDBOX_MAX_AGE_SECONDS = 600


async def execute_run(ctx: dict, run_id: str):
    log.info("run.start", run_id=run_id)
    run = (
        supabase_admin.table("pipeline_runs")
        .select("*")
        .eq("id", run_id)
        .single()
        .execute()
    )
    data = run.data

    supabase_admin.table("pipeline_runs").update({"status": "running"}).eq("id", run_id).execute()

    state = PipelineState(
        run_id=run_id,
        organization_id=data["organization_id"],
        product_idea=data["product_idea"],
        onboarding_data=data.get("onboarding_data") or {},
        status="running",
    )

    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": data["langgraph_thread_id"]}}
    try:
        result = await graph.ainvoke(state, config)
        snapshot = await graph.aget_state(config)
        if snapshot.next:
            state_data = snapshot.values
            if state_data.get("agent_03_output") and not state_data.get("agent_04_output"):
                supabase_admin.table("pipeline_runs").update(
                    {"status": "awaiting_approval"}
                ).eq("id", run_id).execute()
                log.info("run.awaiting_approval", run_id=run_id)
            else:
                supabase_admin.table("pipeline_runs").update(
                    {"status": "awaiting_clarification"}
                ).eq("id", run_id).execute()
                log.info("run.awaiting_clarification", run_id=run_id)
        else:
            supabase_admin.table("pipeline_runs").update({
                "status": result.get("status", "completed") if isinstance(result, dict) else "completed",
                "current_agent": result.get("current_agent") if isinstance(result, dict) else None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", run_id).execute()
            log.info("run.completed", run_id=run_id)
    except PlanRequiredError as e:
        supabase_admin.table("pipeline_runs").update({
            "status": "awaiting_upgrade",
            "error": str(e),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", run_id).execute()
        log.warning("run.plan_required", run_id=run_id, error=str(e))
    except Exception as e:
        supabase_admin.table("pipeline_runs").update({
            "status": "failed", "error": str(e),
        }).eq("id", run_id).execute()
        log.error("run.failed", run_id=run_id, error=str(e))
        raise


async def reap_orphaned_sandboxes(ctx: dict):
    from e2b_code_interpreter import Sandbox
    try:
        sandboxes = Sandbox.list(api_key=settings.E2B_API_KEY)
    except Exception as e:
        log.error("sandbox.list_failed", error=str(e))
        return

    reaped = 0
    for sb in sandboxes:
        age = getattr(sb, "age_seconds", None)
        if age is not None and age > SANDBOX_MAX_AGE_SECONDS:
            try:
                Sandbox.connect(sb.id, api_key=settings.E2B_API_KEY).kill()
                reaped += 1
                log.info("sandbox.reaped", sandbox_id=sb.id, age_seconds=age)
            except Exception as e:
                log.warning("sandbox.reap_failed", sandbox_id=sb.id, error=str(e))

    if reaped > 0:
        log.info("sandbox.reap_complete", reaped=reaped)


class WorkerSettings:
    functions = [execute_run]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    max_jobs = 5
    health_check_interval = 10
    cron_jobs = [cron(reap_orphaned_sandboxes, minute=set(range(0, 60, 10)))]

    @staticmethod
    async def on_startup(ctx):
        await init_graph()
