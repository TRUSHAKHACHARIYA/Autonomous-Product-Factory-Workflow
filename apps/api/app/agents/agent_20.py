import json
from app.sandbox.executor import run_in_sandbox
from app.agents.artifacts import save_artifact
from app.models.agent_20 import SandboxExecutionOutput
from app.models.state import PipelineState
from app.logging import log


async def agent_20_node(state: PipelineState) -> PipelineState:
    output: SandboxExecutionOutput = await run_in_sandbox(state)

    real_bugs = [b.model_dump() for b in output.real_bugs]
    existing_bugs = state.agent_14_bugs
    verified_ids: dict[str, bool] = {b["id"]: False for b in existing_bugs}
    merged: list[dict] = []
    merge_counter = 0

    for b in existing_bugs:
        if b["severity"] in ("Critical", "High"):
            real_match = _find_matching_real_bug(b, output.real_bugs)
            if real_match:
                merged.append({
                    **b, "real_bug_id": real_match.id,
                    "verified": True,
                    "error_message": real_match.error_message,
                })
                verified_ids[b["id"]] = True
            else:
                merged.append({**b, "verified": False})
        else:
            merged.append({**b, "verified": False})

    for rb in output.real_bugs:
        already_matched = any(
            m.get("real_bug_id") == rb.id for m in merged
        )
        if not already_matched:
            merge_counter += 1
            merged.append({
                "id": f"RT-{merge_counter:03d}",
                "severity": rb.severity,
                "title": rb.error_message[:120],
                "steps_to_reproduce": f"Sandbox run: {rb.test_name}",
                "expected": "Test should pass",
                "actual": rb.error_message[:500],
                "file": rb.file,
                "module": "",
                "origin": rb.origin,
                "real_bug_id": rb.id,
                "verified": True,
                "error_message": rb.error_message,
            })

    if not output.build_succeeded:
        merged.insert(0, {
            "id": "RT-BUILD",
            "severity": "Critical",
            "title": "Build failure in sandbox",
            "steps_to_reproduce": "npm run build",
            "expected": "Build succeeds with exit code 0",
            "actual": output.build_error[:1000],
            "file": "package.json",
            "module": "",
            "origin": "frontend",
            "real_bug_id": "RT-BUILD",
            "verified": True,
            "error_message": output.build_error[:1000],
        })

    coverage_pct = 0.0
    if output.real_coverage_percent:
        all_pcts = list(output.real_coverage_percent.values())
        coverage_pct = sum(all_pcts) / len(all_pcts) if all_pcts else 0.0

    agent_20_output = {
        "build_succeeded": output.build_succeeded,
        "build_error": output.build_error,
        "test_results": [r.model_dump() for r in output.test_results],
        "real_bugs": real_bugs,
        "real_coverage_percent": coverage_pct,
    }

    await _generate_agent_20_artifacts(state.run_id, output, merged)

    log.info(
        "agent_20.completed",
        run_id=state.run_id,
        build_succeeded=output.build_succeeded,
        real_bugs=len(real_bugs),
        merged_bugs=len(merged),
    )

    return state.model_copy(
        update={
            "agent_14_bugs": merged,
            "agent_14_output": {
                **state.agent_14_output,
                "agent_20_output": agent_20_output,
            },
            "current_agent": "agent_20_test_executor",
            "status": "running",
        }
    )


def _find_matching_real_bug(bug: dict, real_bugs: list) -> object | None:
    bug_file = bug.get("file", "")
    bug_title = bug.get("title", "").lower()
    for rb in real_bugs:
        if bug_file and rb.file and bug_file in rb.file:
            return rb
        if bug_title and bug_title in rb.error_message.lower():
            return rb
    return None


async def _generate_agent_20_artifacts(
    run_id: str, output: SandboxExecutionOutput, merged_bugs: list[dict],
):
    summary_lines = [
        "# Phase 20 — Real Test Execution Summary",
        "",
        f"**Build Succeeded:** {'Yes' if output.build_succeeded else 'No'}",
        "",
    ]
    if not output.build_succeeded:
        summary_lines.append(f"**Build Error:**\n```\n{output.build_error[:2000]}\n```")
        summary_lines.append("")

    if output.test_results:
        summary_lines.append("## Test Results")
        summary_lines.append("")
        summary_lines.append("| Test Type | Total | Passed | Failed | Skipped | Duration |")
        summary_lines.append("|-----------|-------|--------|--------|---------|----------|")
        for r in output.test_results:
            summary_lines.append(
                f"| {r.test_type} | {r.total_tests} | {r.passed} | {r.failed} | {r.skipped} | {r.duration_seconds:.1f}s |"
            )
        summary_lines.append("")

    total_tests = sum(r.total_tests for r in output.test_results)
    total_passed = sum(r.passed for r in output.test_results)
    total_failed = sum(r.failed for r in output.test_results)
    summary_lines.append(
        f"**Overall:** {total_passed}/{total_tests} passed, {total_failed} failed"
    )
    summary_lines.append("")

    if output.real_coverage_percent:
        summary_lines.append("## Coverage")
        summary_lines.append("")
        for mod, pct in sorted(output.real_coverage_percent.items()):
            summary_lines.append(f"- **{mod}**: {pct:.1f}%")
        summary_lines.append("")

    if output.real_bugs:
        summary_lines.append("## Real Bugs Found in Sandbox")
        summary_lines.append("")
        summary_lines.append("| ID | Severity | File | Error |")
        summary_lines.append("|-----|----------|------|-------|")
        for b in output.real_bugs:
            summary_lines.append(f"| {b.id} | {b.severity} | {b.file} | {b.error_message[:80]} |")
        summary_lines.append("")

    summary_lines.append("## Bug Reconciliation")
    summary_lines.append("")
    verified = [b for b in merged_bugs if b.get("verified")]
    unverified = [b for b in merged_bugs if not b.get("verified")]
    summary_lines.append(
        f"**Verified (real failures):** {len(verified)}  "
        f"**Unverified (LLM-assessed only):** {len(unverified)}"
    )
    summary_lines.append("")

    await save_artifact(
        run_id, "agent_20_test_executor", "execution_summary.md",
        "\n".join(summary_lines),
    )

    await save_artifact(
        run_id, "agent_20_test_executor", "real_bugs.json",
        json.dumps([b.model_dump() for b in output.real_bugs], indent=2),
    )

    await save_artifact(
        run_id, "agent_20_test_executor", "merged_bugs.json",
        json.dumps(merged_bugs, indent=2),
    )
