import asyncio
import json
from app.agents.base import run_agent_task
from app.agents.prompts.agent_15 import (
    AGENT_15_SYSTEM_PROMPT_TEMPLATE,
    STRATEGY_NOTES,
)
from app.agents.artifacts import save_artifact
from app.models.agent_15 import FixAttempt, BugFixResult, Agent15Output
from app.models.state import PipelineState
from app.sandbox.executor import run_in_sandbox_single_test
from app.logging import log

MAX_FIX_ATTEMPTS = 3


def _build_file_lookup(state: PipelineState) -> dict[tuple[str, str], dict]:
    lookup: dict[tuple[str, str], dict] = {}
    for m in state.agent_08_output["modules"]:
        for f in m["files"]:
            lookup[("frontend", f["path"])] = f
    for m in state.agent_11_output["modules"]:
        for f in m["files"]:
            lookup[("backend", f["path"])] = f
    return lookup


async def _fix_bug(
    state: PipelineState, bug: dict, file_lookup: dict
) -> BugFixResult:
    origin = bug.get("origin", "frontend")
    key = (origin, bug["file"])
    current_file = file_lookup.get(key)
    if current_file is None:
        return BugFixResult(
            bug_id=bug["id"],
            status="SKIPPED_FILE_NOT_FOUND",
            escalation_reason=(
                f"File {bug['file']} referenced by this bug was not found "
                "in generated code."
            ),
        )

    attempts: list[FixAttempt] = []
    for attempt_num in range(1, MAX_FIX_ATTEMPTS + 1):
        system_prompt = AGENT_15_SYSTEM_PROMPT_TEMPLATE.format(
            bug_id=bug["id"],
            strategy_note=STRATEGY_NOTES[attempt_num],
        )
        input_payload = {
            "bug": bug,
            "current_file": (
                current_file
                if attempt_num == 1
                else attempts[-1].fixed_file.model_dump()
            ),
            "previous_attempt_explanation": (
                attempts[-1].explanation if attempts else None
            ),
        }
        result: FixAttempt = await run_agent_task(
            run_id=state.run_id,
            organization_id=state.organization_id,
            agent_name=(
                f"agent_15_fixloop::{bug['id']}::attempt_{attempt_num}"
            ),
            model="claude-sonnet-5",
            system_prompt=system_prompt,
            user_message=json.dumps(input_payload, indent=2),
            output_schema=FixAttempt,
            max_tokens=8000,
        )
        attempts.append(result)

        retest = await run_in_sandbox_single_test(
            state, bug, result.fixed_file.model_dump(),
        )
        result.sandbox_retest_passed = retest["passed"]
        result.sandbox_retest_error = retest.get("error", "")

        log.info(
            "agent_15.retest",
            bug_id=bug["id"],
            attempt=attempt_num,
            passed=retest["passed"],
        )

        if retest["passed"]:
            break

    resolved = attempts[-1].sandbox_retest_passed
    return BugFixResult(
        bug_id=bug["id"],
        status="RESOLVED" if resolved else "ESCALATED",
        attempts=attempts,
        root_cause=attempts[0].explanation,
        final_fix_summary=attempts[-1].explanation,
        escalation_reason=(
            None
            if resolved
            else (
                "Sandbox retest failed after 3 fix attempts -- "
                "human review needed."
            )
        ),
    )


def _apply_fix_to_modules(
    modules: list[dict], file_path: str, fixed_content: str
) -> list[dict]:
    for m in modules:
        for f in m["files"]:
            if f["path"] == file_path:
                f["content"] = fixed_content
    return modules


def _apply_fix_by_origin(
    updated_fe: list[dict],
    updated_be: list[dict],
    bug: dict,
    final_file,
):
    if bug.get("origin") == "frontend":
        updated_fe = _apply_fix_to_modules(updated_fe, final_file.path, final_file.content)
    elif bug.get("origin") == "backend":
        updated_be = _apply_fix_to_modules(updated_be, final_file.path, final_file.content)
    else:
        updated_fe = _apply_fix_to_modules(updated_fe, final_file.path, final_file.content)
        updated_be = _apply_fix_to_modules(updated_be, final_file.path, final_file.content)
    return updated_fe, updated_be


async def agent_15_node(state: PipelineState) -> PipelineState:
    critical_high = [
        b
        for b in state.agent_14_bugs
        if b["severity"] in ("Critical", "High")
    ]
    deferred = [
        b
        for b in state.agent_14_bugs
        if b["severity"] in ("Medium", "Low")
    ]
    file_lookup = _build_file_lookup(state)

    fix_results: list[BugFixResult] = (
        await asyncio.gather(
            *[_fix_bug(state, bug, file_lookup) for bug in critical_high]
        )
        if critical_high
        else []
    )

    updated_fe = json.loads(json.dumps(state.agent_08_output["modules"]))
    updated_be = json.loads(json.dumps(state.agent_11_output["modules"]))
    for result in fix_results:
        if result.status == "RESOLVED":
            final_file = result.attempts[-1].fixed_file
            bug = next(
                b for b in critical_high if b["id"] == result.bug_id
            )
            updated_fe, updated_be = _apply_fix_by_origin(
                updated_fe, updated_be, bug, final_file
            )

    output = Agent15Output(fix_results=fix_results, v2_backlog=deferred)
    await _generate_agent_15_artifacts(state.run_id, output)

    return state.model_copy(
        update={
            "agent_08_output": {"modules": updated_fe},
            "agent_11_output": {"modules": updated_be},
            "agent_15_output": output.model_dump(),
            "current_agent": "agent_15_fixloop",
            "status": "running",
        }
    )


async def _generate_agent_15_artifacts(run_id: str, output: Agent15Output):
    patches_md = ""
    retest_md = "| Bug ID | Status | Notes |\n|---|---|---|\n"
    for r in output.fix_results:
        icon = {
            "RESOLVED": "✅",
            "ESCALATED": "🚨",
            "SKIPPED_FILE_NOT_FOUND": "⏭️",
        }[r.status]
        patches_md += f"#### {r.bug_id} -- {r.status}\n"
        if r.status == "RESOLVED":
            last = r.attempts[-1]
            patches_md += (
                f"**Root Cause:** {r.root_cause}\n"
                f"**Fix Applied to:** {last.fixed_file.path}\n\n"
                f"```\n{last.fixed_file.content}\n```\n\n"
            )
            retest_md += (
                f"| {r.bug_id} | {icon} Resolved "
                f"(sandbox retest passed) | "
                f"{len(r.attempts)} attempt(s) |\n"
            )
        else:
            patches_md += (
                f"**Reason:** {r.escalation_reason}\n\n"
            )
            retest_md += (
                f"| {r.bug_id} | {icon} {r.status} | "
                f"{r.escalation_reason or ''} |\n"
            )

    await save_artifact(
        run_id, "agent_15_fixloop", "fixed_code_patches.md", patches_md
    )
    await save_artifact(
        run_id,
        "agent_15_fixloop",
        "retest_results.md",
        "**Note: 'Resolved' means the sandbox retest passed after the fix "
        "was applied, not a self-assessment.**\n\n" + retest_md
    )

    resolved_json = [
        {
            "id": r.bug_id,
            "status": r.status,
            "fix_summary": r.final_fix_summary or r.escalation_reason or "",
        }
        for r in output.fix_results
    ]
    await save_artifact(
        run_id,
        "agent_15_fixloop",
        "resolved_bugs.json",
        json.dumps(resolved_json, indent=2),
    )

    if output.v2_backlog:
        backlog_md = (
            "#### Medium/Low Priority -- Deferred to V2\n"
            + "\n".join(
                f"- {b['id']} ({b['severity']}): {b['title']}"
                for b in output.v2_backlog
            )
        )
    else:
        backlog_md = "No Medium/Low bugs deferred."
    await save_artifact(
        run_id, "agent_15_fixloop", "v2_backlog.md", backlog_md
    )
