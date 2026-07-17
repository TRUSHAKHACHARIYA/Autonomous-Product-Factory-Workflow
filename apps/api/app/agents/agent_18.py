import json
import sentry_sdk
from app.agents.base import run_agent
from app.agents.prompts.agent_18 import AGENT_18_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.deps import supabase_admin
from app.models.agent_18 import Agent18Output
from app.models.state import PipelineState
from app.logging import log


async def _get_file_index(run_id: str) -> dict[str, list[str]]:
    index: dict[str, list[str]] = {}
    top_level = supabase_admin.storage.from_("pipeline-artifacts").list(run_id)
    for entry in top_level:
        agent_folder = entry["name"]
        files = _list_recursive(f"{run_id}/{agent_folder}")
        index[agent_folder] = files
    return index


def _list_recursive(path: str) -> list[str]:
    files = []
    entries = supabase_admin.storage.from_("pipeline-artifacts").list(path)
    for entry in entries:
        full_path = f"{path}/{entry['name']}"
        if entry.get("id") is None:
            files.extend(_list_recursive(full_path))
        else:
            files.append(full_path)
    return files


async def _get_pipeline_stats(run_id: str, state: PipelineState) -> dict:
    outputs = supabase_admin.table("agent_outputs").select(
        "agent_name, cost_usd, input_tokens, output_tokens, duration_ms, status"
    ).eq("run_id", run_id).execute()
    rows = outputs.data

    total_cost = sum(r["cost_usd"] or 0 for r in rows)
    total_duration_ms = sum(r["duration_ms"] or 0 for r in rows)
    agents_completed = len({r["agent_name"].split("::")[0] for r in rows if r["status"] == "completed"})
    agents_failed = [r["agent_name"] for r in rows if r["status"] == "failed"]

    all_bugs = state.agent_14_bugs or []
    fix_results = (state.agent_15_output or {}).get("fix_results", [])
    resolved = len([r for r in fix_results if r["status"] == "RESOLVED"])
    escalated = len([r for r in fix_results if r["status"] == "ESCALATED"])

    return {
        "total_cost_usd": round(total_cost, 4),
        "total_duration_ms": total_duration_ms,
        "distinct_agent_calls": len(rows),
        "agents_with_failures": agents_failed,
        "bugs_found": len(all_bugs),
        "bugs_resolved": resolved,
        "bugs_escalated": escalated,
    }


def _build_status_summary(state: PipelineState) -> dict:
    fe_gate_result = (state.agent_09_output or {}).get("overall_result")
    be_gate_result = (state.agent_12_output or {}).get("overall_result")
    return {
        "architecture_approval_attempts": state.agent_04_output and 1,
        "design_approval_attempts": state.agent_06_output and 1,
        "frontend_gate_cycles_used": state.fe_gate_cycle,
        "backend_gate_cycles_used": state.be_gate_cycle,
        "frontend_gate_passed": fe_gate_result == "PASS",
        "backend_gate_passed": be_gate_result == "PASS",
        "bugs_found": len(state.agent_14_bugs or []),
        "bugs_resolved": len([
            r for r in (state.agent_15_output or {}).get("fix_results", [])
            if r["status"] == "RESOLVED"
        ]),
        "bugs_escalated": len([
            r for r in (state.agent_15_output or {}).get("fix_results", [])
            if r["status"] == "ESCALATED"
        ]),
        "pre_deploy_warnings": (state.agent_16_output or {}).get("pre_deploy_warnings", []),
        "complexity_score": state.agent_02_output["complexity_score"],
    }


async def agent_18_node(state: PipelineState) -> PipelineState:
    status_summary = _build_status_summary(state)

    result: Agent18Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_18_final_product",
        model="claude-haiku-4-5-20251001",
        system_prompt=AGENT_18_SYSTEM_PROMPT,
        user_message=json.dumps(status_summary, indent=2),
        output_schema=Agent18Output,
        max_tokens=4000,
    )

    file_index = await _get_file_index(state.run_id)
    pipeline_stats = await _get_pipeline_stats(state.run_id, state)

    if pipeline_stats["total_cost_usd"] > 5.0:
        log.warning(
            "cost.anomaly",
            run_id=state.run_id,
            total_cost=pipeline_stats["total_cost_usd"],
        )
        sentry_sdk.capture_message(
            f"Run {state.run_id} cost ${pipeline_stats['total_cost_usd']} — anomaly threshold exceeded",
            level="warning",
        )

    await _generate_final_delivery_artifact(
        state.run_id,
        state.agent_01_output["user_input"]["project_name"],
        state.agent_02_output["complexity_score"],
        result,
        file_index,
        pipeline_stats,
    )

    return state.model_copy(update={
        "agent_18_output": {
            **result.model_dump(),
            "file_index": file_index,
            "pipeline_stats": pipeline_stats,
        },
        "current_agent": "agent_18_final_product",
        "status": "completed",
    })


async def _generate_final_delivery_artifact(
    run_id, project_name, complexity, result, file_index, stats
):
    total_files = sum(len(files) for files in file_index.values())
    md = f"# Project Delivery Summary\n\n## Project: {project_name}\n"
    md += f"## Complexity: {complexity['score']}\n\n---\n\n{result.project_summary}\n\n---\n\n"

    md += "## Delivery Checklist\n"
    by_category: dict[str, list] = {}
    for item in result.delivery_checklist:
        by_category.setdefault(item.category, []).append(item)
    for category, items in by_category.items():
        md += f"\n### {category}\n" + "\n".join(
            f"- [{'x' if i.completed else ' '}] {i.item}" for i in items
        )

    md += "\n\n---\n\n## Complete File Index\n"
    for agent_folder, files in file_index.items():
        md += f"\n#### {agent_folder} ({len(files)} files)\n" + "\n".join(f"- {f}" for f in files)

    md += "\n\n---\n\n## Your Next Steps\n" + "\n".join(
        f"{i+1}. {s}" for i, s in enumerate(result.next_steps)
    )

    md += (
        "\n\n---\n\n## Pipeline Stats\n"
        "| Metric | Value |\n|---|---|\n"
        f"| Agents run | 18 |\n"
        f"| Distinct agent calls (incl. parallel modules/retries) | {stats['distinct_agent_calls']} |\n"
        f"| Files generated | {total_files} |\n"
        f"| Total cost | ${stats['total_cost_usd']} |\n"
        f"| Total execution time | {stats['total_duration_ms'] / 1000:.1f}s |\n"
        f"| Bugs found | {stats['bugs_found']} |\n"
        f"| Bugs resolved | {stats['bugs_resolved']} |\n"
        f"| Bugs escalated | {stats['bugs_escalated']} |\n"
    )
    if stats["agents_with_failures"]:
        md += (
            f"\nNote: {len(stats['agents_with_failures'])} agent call(s) recorded a failed status "
            f"during this run: {', '.join(stats['agents_with_failures'])}\n"
        )

    await save_artifact(run_id, "agent_18_final_product", "final_delivery.md", md)
