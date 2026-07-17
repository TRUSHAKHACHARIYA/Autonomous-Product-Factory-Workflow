import asyncio
import json
from app.agents.base import run_agent
from app.agents.prompts.agent_09 import (
    AGENT_09_SYSTEM_PROMPT_TEMPLATE,
    AGENT_09_FIX_SYSTEM_PROMPT_TEMPLATE,
)
from app.agents.artifacts import save_artifact
from app.models.agent_08 import GeneratedFile
from app.models.agent_09 import ModuleReviewOutput, Agent09Output
from app.models.state import PipelineState

MAX_GATE_CYCLES = 2


async def _review_module(state: PipelineState, module: dict) -> ModuleReviewOutput:
    system_prompt = AGENT_09_SYSTEM_PROMPT_TEMPLATE.format(
        module_name=module["module_name"]
    )
    input_payload = {
        "files": module["files"],
        "component_contracts": state.agent_07_output["component_contracts"],
        "design_system": state.agent_06_output["design_system"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "security_checklist": state.agent_05_output["security_checklist"],
    }
    result = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name=f"agent_09_frontend_gate::{module['module_name']}::cycle_{state.fe_gate_cycle}",
        model="claude-sonnet-5",
        system_prompt=system_prompt,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=ModuleReviewOutput,
        max_tokens=8000,
    )
    return result


async def agent_09_node(state: PipelineState) -> PipelineState:
    modules = state.agent_08_output["modules"]
    module_reviews: list[ModuleReviewOutput] = await asyncio.gather(
        *[_review_module(state, m) for m in modules]
    )

    overall = (
        "PASS"
        if all(m.module_result == "Pass" for m in module_reviews)
        else "FAIL"
    )
    output = Agent09Output(
        overall_result=overall, module_reviews=list(module_reviews)
    )

    await _generate_agent_09_artifacts(state.run_id, output, state.fe_gate_cycle)

    return state.model_copy(
        update={
            "agent_09_output": output.model_dump(),
            "current_agent": "agent_09_frontend_gate",
            "status": "running",
        }
    )


async def _fix_file(
    state: PipelineState,
    module_name: str,
    file: dict,
    fix_tasks: list[dict],
) -> GeneratedFile:
    system_prompt = AGENT_09_FIX_SYSTEM_PROMPT_TEMPLATE.format(
        module_name=module_name
    )
    input_payload = {"file": file, "fix_tasks": fix_tasks}
    result = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name=f"agent_08_fix::{module_name}::{file['path']}::cycle_{state.fe_gate_cycle}",
        model="claude-sonnet-5",
        system_prompt=system_prompt,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=GeneratedFile,
        max_tokens=8000,
    )
    return result


async def agent_08_fix_node(state: PipelineState) -> PipelineState:
    """Applies targeted fixes to only the files that failed review, rather than
    regenerating entire modules from scratch."""
    review = state.agent_09_output
    modules = {m["module_name"]: m for m in state.agent_08_output["modules"]}

    fix_jobs = []
    for module_review in review["module_reviews"]:
        if module_review["module_result"] != "Fail":
            continue
        module_name = module_review["module_name"]
        files_by_path = {f["path"]: f for f in modules[module_name]["files"]}
        tasks_by_file: dict[str, list[dict]] = {}
        for task in module_review["fix_tasks"]:
            tasks_by_file.setdefault(task["file"], []).append(task)
        for file_path, tasks in tasks_by_file.items():
            if file_path in files_by_path:
                fix_jobs.append(
                    (module_name, files_by_path[file_path], tasks)
                )

    fixed_files = await asyncio.gather(
        *[
            _fix_file(state, module_name, file, tasks)
            for module_name, file, tasks in fix_jobs
        ]
    )

    updated_modules = json.loads(
        json.dumps(state.agent_08_output["modules"])
    )  # deep copy
    for (module_name, _, _), fixed in zip(fix_jobs, fixed_files):
        for m in updated_modules:
            if m["module_name"] == module_name:
                for i, f in enumerate(m["files"]):
                    if f["path"] == fixed.path:
                        m["files"][i] = fixed.model_dump()

    return state.model_copy(
        update={
            "agent_08_output": {"modules": updated_modules},
            "fe_gate_cycle": state.fe_gate_cycle + 1,
        }
    )


def route_after_frontend_gate(state: PipelineState) -> str:
    if state.agent_09_output["overall_result"] == "PASS":
        return "agent_10_backend_senior"
    if state.fe_gate_cycle >= MAX_GATE_CYCLES:
        return "agent_10_backend_senior"   # exhausted retries — proceed anyway, flagged
    return "agent_08_fix"


async def _generate_agent_09_artifacts(
    run_id: str, output: Agent09Output, cycle: int
):
    all_file_reviews = [
        fr for m in output.module_reviews for fr in m.file_reviews
    ]
    review_md = f"#### Overall Result: {'✅ PASS' if output.overall_result == 'PASS' else '❌ FAIL'} (cycle {cycle})\n\n"
    review_md += (
        "| File | Status | Issues |\n|---|---|---|\n"
        + "\n".join(
            f"| {fr.file} | {'✅ Pass' if fr.status == 'Pass' else '❌ Fail'} | {fr.issues} |"
            for fr in all_file_reviews
        )
    )
    all_fix_tasks = [
        ft for m in output.module_reviews for ft in m.fix_tasks
    ]
    if all_fix_tasks:
        review_md += "\n\n#### Issues to Fix\n" + "\n".join(
            f"- {t.id} ({t.severity}): {t.file} — {t.fix}"
            for t in all_fix_tasks
        )
    await save_artifact(
        run_id,
        "agent_09_frontend_gate",
        f"fe_review_report_cycle_{cycle}.md",
        review_md,
    )
    await save_artifact(
        run_id,
        "agent_09_frontend_gate",
        f"fe_fix_tasks_cycle_{cycle}.json",
        json.dumps(
            [t.model_dump() for t in all_fix_tasks], indent=2
        ),
    )
