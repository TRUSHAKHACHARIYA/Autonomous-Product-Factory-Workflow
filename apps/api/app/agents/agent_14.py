import asyncio
import json
from app.agents.base import run_agent
from app.agents.prompts.agent_14 import (
    AGENT_14_SYSTEM_PROMPT_TEMPLATE,
    TYPE_SPECIFIC_INSTRUCTIONS,
)
from app.agents.artifacts import save_artifact
from app.models.agent_14 import TestTypeOutput, Agent14Output, Bug
from app.models.state import PipelineState

TEST_TYPES = [
    "Unit", "Integration", "E2E", "Performance",
    "Accessibility", "Security", "CrossBrowser", "Regression",
]


def _extract_integration_mismatches(state: PipelineState) -> list[dict]:
    fe_files = {
        f["path"]: f
        for m in state.agent_08_output["modules"]
        for f in m["files"]
    }
    be_files = {
        f["path"]: f
        for m in state.agent_11_output["modules"]
        for f in m["files"]
    }
    mismatches: list[dict] = []
    fe_bugs = {
        b["file"]: b["actual"]
        for b in (state.agent_14_bugs or [])
        if b.get("origin") == "frontend"
    }
    be_bugs = {
        b["file"]: b["actual"]
        for b in (state.agent_14_bugs or [])
        if b.get("origin") == "backend"
    }
    for path, fe_content in fe_files.items():
        if path in be_files:
            fe_code = fe_content.get("content", "")
            be_code = be_files[path].get("content", "")
            if fe_code != be_code:
                mismatches.append({
                    "file": path,
                    "type": "content_divergence",
                    "detail": "Frontend and backend versions of this shared file diverge after QA fixes.",
                    "fe_version_buggy": fe_bugs.get(path),
                    "be_version_buggy": be_bugs.get(path),
                })
    return mismatches


async def _run_test_type(
    state: PipelineState, test_type: str, shared_context: dict
) -> TestTypeOutput:
    system_prompt = AGENT_14_SYSTEM_PROMPT_TEMPLATE.format(
        test_type=test_type,
        type_specific_instruction=TYPE_SPECIFIC_INSTRUCTIONS[test_type],
    )
    return await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name=f"agent_14_qa::{test_type}",
        model="claude-sonnet-5",
        system_prompt=system_prompt,
        user_message=json.dumps(shared_context, indent=2),
        output_schema=TestTypeOutput,
        max_tokens=16000,
    )


async def agent_14_node(state: PipelineState) -> PipelineState:
    fe_modules = state.agent_08_output["modules"]
    be_modules = state.agent_11_output["modules"]
    fe_module_names = {m["module_name"] for m in fe_modules}
    be_module_names = {m["module_name"] for m in be_modules}
    fe_files = {f["path"] for m in fe_modules for f in m["files"]}
    be_files = {f["path"] for m in be_modules for f in m["files"]}

    shared_context = {
        "frontend_modules": fe_modules,
        "backend_modules": be_modules,
        "acceptance_criteria": state.agent_03_output["acceptance_criteria"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "user_journeys": state.agent_02_output["user_journeys"],
        "security_checklist": state.agent_05_output["security_checklist"],
        "known_integration_mismatches": _extract_integration_mismatches(state),
        "agent_13_mismatches": [
            {"id": m["id"], "description": m["description"], "fix": m["fix"]}
            for m in (state.agent_13_output or {}).get("mismatches", [])
        ],
    }

    results: list[TestTypeOutput] = await asyncio.gather(
        *[_run_test_type(state, t, shared_context) for t in TEST_TYPES]
    )

    bug_counter = 1
    all_bugs: list[Bug] = []
    for result in results:
        for bug in result.bugs_found:
            bug.id = f"BUG-{bug_counter:03d}"
            bug.origin = "frontend" if bug.file in fe_files else "backend"
            bug_counter += 1
            all_bugs.append(bug)

    def assign_owner(bug: Bug) -> str:
        prefix = "FE" if bug.origin == "frontend" else "BE"
        return f"{prefix} Junior: {bug.module}"

    output = Agent14Output(test_type_results=results)
    await _generate_agent_14_artifacts(state.run_id, output, all_bugs, assign_owner)

    return state.model_copy(
        update={
            "agent_14_output": output.model_dump(),
            "agent_14_bugs": [b.model_dump() for b in all_bugs],
            "current_agent": "agent_14_qa",
            "status": "running",
        }
    )


async def _generate_agent_14_artifacts(
    run_id: str,
    output: Agent14Output,
    all_bugs: list[Bug],
    assign_owner,
):
    for result in output.test_type_results:
        for f in result.files:
            await save_artifact(
                run_id,
                "agent_14_qa",
                f"test_suite/{result.test_type.lower()}/{f.path}",
                f.content,
            )

    by_severity: dict[str, list[Bug]] = {
        "Critical": [], "High": [], "Medium": [], "Low": [],
    }
    for bug in all_bugs:
        by_severity[bug.severity].append(bug)

    bug_report_md = ""
    for sev in ["Critical", "High", "Medium", "Low"]:
        if by_severity[sev]:
            bug_report_md += f"#### {sev} Bugs\n" + "\n".join(
                f"- {b.id}: {b.title} -- {b.steps_to_reproduce} -- "
                f"Expected: {b.expected} -- Actual: {b.actual} -- {b.file}"
                for b in by_severity[sev]
            ) + "\n\n"

    await save_artifact(
        run_id,
        "agent_14_qa",
        "bug_report.md",
        bug_report_md or "No bugs found across any test type.",
    )

    fix_tasks = [
        {
            "id": b.id,
            "severity": b.severity,
            "title": b.title,
            "module": b.module,
            "origin": b.origin,
            "assigned_to": assign_owner(b),
            "file": b.file,
            "fix_instruction": b.actual,
        }
        for b in all_bugs
    ]
    await save_artifact(
        run_id,
        "agent_14_qa",
        "fix_tasks.json",
        json.dumps(fix_tasks, indent=2),
    )

    unit_result = next(
        (r for r in output.test_type_results if r.test_type == "Unit"), None
    )
    if unit_result and unit_result.coverage_estimates:
        coverage_md = (
            "**Note: these are AI-estimated coverage figures based on test-writing review, "
            "not measured by running a coverage tool.**\n\n"
        )
        coverage_md += (
            "| Module | Estimated Coverage |\n|---|---|\n"
            + "\n".join(
                f"| {c.module} | {c.estimated_coverage_percent}% |"
                for c in unit_result.coverage_estimates
            )
        )
        overall = sum(
            c.estimated_coverage_percent for c in unit_result.coverage_estimates
        ) / len(unit_result.coverage_estimates)
        coverage_md += f"\n| **Overall (est.)** | **{overall:.0f}%** |"
        await save_artifact(
            run_id, "agent_14_qa", "coverage_report.md", coverage_md
        )
