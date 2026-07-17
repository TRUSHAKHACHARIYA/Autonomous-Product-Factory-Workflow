import json
import re
from app.deps import supabase_admin
from app.models.state import PipelineState
from app.models.agent_20 import RealTestResult, RealBug, SandboxExecutionOutput
from app.logging import log
from app.config import settings

from e2b_code_interpreter import Sandbox


TEST_COMMANDS = {
    "Unit": "npm run test:unit -- --reporter=json 2>&1 || true",
    "Integration": "npm run test:integration -- --reporter=json 2>&1 || true",
    "E2E": "npx playwright test --reporter=json 2>&1 || true",
    "Performance": "k6 run --summary-export=perf_summary.json test_suite/performance/*.js 2>&1 || true",
    "Accessibility": "npm run test:a11y -- --reporter=json 2>&1 || true",
    "Security": "npm run test:security -- --reporter=json 2>&1 || true",
    "CrossBrowser": "npx playwright test --config=playwright.crossbrowser.config.ts --reporter=json 2>&1 || true",
    "Regression": "npm run test:regression -- --reporter=json 2>&1 || true",
}

COVERAGE_COMMANDS = {
    "Unit": "npx nyc report --reporter=json-summary 2>/dev/null && cat coverage/coverage-summary.json || echo {}",
}


async def run_in_sandbox(state: PipelineState) -> SandboxExecutionOutput:
    sandbox = Sandbox(api_key=settings.E2B_API_KEY)

    try:
        await _write_all_files(sandbox, state)
        build_result = await _run_build(sandbox)
        if not build_result["success"]:
            log.warning("sandbox.build_failed", error=build_result["output"][:500])
            return SandboxExecutionOutput(
                build_succeeded=False, build_error=build_result["output"][:2000],
            )

        test_results: list[RealTestResult] = []
        real_bugs: list[RealBug] = []
        bug_counter = 1

        for test_type_result in state.agent_14_output["test_type_results"]:
            test_type = test_type_result["test_type"]
            result = await _run_test_command(sandbox, test_type)
            test_results.append(result["summary"])

            for bug_data in result["bugs"]:
                bug_data["id"] = f"RT-{bug_counter:03d}"
                real_bugs.append(RealBug(**bug_data))
                bug_counter += 1

        coverage = await _extract_coverage(sandbox)

        log.info(
            "sandbox.completed",
            total_tests=sum(r.total_tests for r in test_results),
            total_failed=sum(r.failed for r in test_results),
            real_bugs=len(real_bugs),
        )

        return SandboxExecutionOutput(
            build_succeeded=True,
            test_results=test_results,
            real_bugs=real_bugs,
            real_coverage_percent=coverage,
        )
    finally:
        sandbox.kill()


async def run_in_sandbox_single_test(
    state: PipelineState, bug: dict, fixed_file: dict,
) -> dict:
    sandbox = Sandbox(api_key=settings.E2B_API_KEY)
    try:
        await _write_all_files(sandbox, state)
        sandbox.files.write(fixed_file["path"], fixed_file["content"])

        build_result = await _run_build(sandbox)
        if not build_result["success"]:
            return {"passed": False, "error": build_result["output"][:500]}

        test_type = bug.get("test_type", "Unit")
        result = await _run_test_command(sandbox, test_type)
        passed = result["summary"].failed == 0
        return {"passed": passed, "error": result["summary"].raw_output_excerpt[:500] if not passed else ""}
    finally:
        sandbox.kill()


async def _write_all_files(sandbox: Sandbox, state: PipelineState):
    all_modules = state.agent_08_output["modules"] + state.agent_11_output["modules"]
    for module in all_modules:
        for f in module["files"]:
            sandbox.files.write(f["path"], f["content"])

    if state.agent_13_output:
        for f in state.agent_13_output.get("api_client_files", []):
            sandbox.files.write(f["path"], f["content"])

    if state.agent_14_output:
        for test_result in state.agent_14_output["test_type_results"]:
            for f in test_result["files"]:
                test_dir = f"test_suite/{test_result['test_type'].lower()}"
                sandbox.files.write(f"{test_dir}/{f['path']}", f["content"])


async def _run_build(sandbox: Sandbox) -> dict:
    result = sandbox.commands.run(
        "npm install && npm run build 2>&1",
        timeout=120,
    )
    return {"success": result.exit_code == 0, "output": (result.stdout or "") + (result.stderr or "")}


async def _run_test_command(sandbox: Sandbox, test_type: str) -> dict:
    command = TEST_COMMANDS.get(test_type)
    if not command:
        return {
            "summary": RealTestResult(
                test_type=test_type, total_tests=0, passed=0, failed=0,
                skipped=0, duration_seconds=0, raw_output_excerpt="Test type not supported in sandbox",
            ),
            "bugs": [],
        }

    result = sandbox.commands.run(command, timeout=300)
    raw_output = (result.stdout or "") + (result.stderr or "")
    return _parse_test_output(test_type, raw_output, result.exit_code)


def _parse_test_output(test_type: str, output: str, exit_code: int) -> dict:
    summary = RealTestResult(
        test_type=test_type, total_tests=0, passed=0, failed=0,
        skipped=0, duration_seconds=0, raw_output_excerpt=output[:1000],
    )
    bugs: list[dict] = []

    try:
        data = json.loads(output)
    except (json.JSONDecodeError, ValueError):
        summary.total_tests = 1 if exit_code != 0 else 0
        summary.failed = 1 if exit_code != 0 else 0
        if exit_code != 0:
            bugs.append({
                "severity": "Critical", "test_type": test_type,
                "test_name": "unknown", "file": "unknown",
                "origin": "fe", "error_message": output[:500],
            })
        return {"summary": summary, "bugs": bugs}

    if "testResults" in data:
        for suite in data["testResults"]:
            for test in suite.get("testResults", []):
                summary.total_tests += 1
                status = test.get("status", "unknown")
                if status == "passed":
                    summary.passed += 1
                elif status == "failed":
                    summary.failed += 1
                    file_path = _extract_file_path(test.get("ancestorTitles", []), test.get("failureMessages", [""]))
                    bugs.append({
                        "severity": "High", "test_type": test_type,
                        "test_name": test.get("fullName", "unknown"),
                        "file": file_path,
                        "origin": "fe" if "frontend" in file_path.lower() else "be",
                        "error_message": (test.get("failureMessages") or [""])[0][:500],
                        "stack_trace": "\n".join(test.get("failureMessages") or []),
                    })
                else:
                    summary.skipped += 1

    elif "suites" in data:
        def _walk_playwright_suites(suites_list):
            for suite in suites_list:
                for spec in suite.get("specs", []):
                    for test in spec.get("tests", []):
                        for result in test.get("results", []):
                            summary.total_tests += 1
                            if result.get("status") == "passed":
                                summary.passed += 1
                            elif result.get("status") in ("failed", "timedOut"):
                                summary.failed += 1
                                file_path = spec.get("file", "unknown")
                                error_msg = ""
                                for attachment in result.get("attachments", []):
                                    if attachment.get("name") == "stderr":
                                        error_msg = attachment.get("body", "")[:500]
                                if not error_msg:
                                    error_msg = (result.get("error", {}).get("message", "")[:500])
                                bugs.append({
                                    "severity": "High", "test_type": test_type,
                                    "test_name": spec.get("title", "unknown"),
                                    "file": file_path,
                        "origin": "frontend" if "frontend" in file_path.lower() else "backend",
                                    "error_message": error_msg,
                                    "stack_trace": result.get("error", {}).get("stack", ""),
                                })
                            else:
                                summary.skipped += 1
                _walk_playwright_suites(suite.get("suites", []))
        _walk_playwright_suites(data.get("suites", []))

    elif "root_group" in data:
        summary.total_tests = data.get("metrics", {}).get("root_groups", {}).get("counts", {}).get("tests", 0)
        summary.passed = summary.total_tests - data.get("metrics", {}).get("root_groups", {}).get("counts", {}).get("failures", 0)
        summary.failed = data.get("metrics", {}).get("root_groups", {}).get("counts", {}).get("failures", 0)

    return {"summary": summary, "bugs": bugs}


def _extract_file_path(ancestors: list[str], failure_messages: list[str]) -> str:
    if failure_messages:
        match = re.search(r"at\s+(.+?\.tsx?:\d+:\d+)", failure_messages[0])
        if match:
            return match.group(1).rsplit(":", 1)[0]
    return ancestors[-1] if ancestors else "unknown"


async def _extract_coverage(sandbox: Sandbox) -> dict[str, float]:
    coverage: dict[str, float] = {}
    command = COVERAGE_COMMANDS.get("Unit")
    if not command:
        return coverage

    result = sandbox.commands.run(command, timeout=60)
    try:
        data = json.loads(result.stdout or "{}")
        for key, val in data.items():
            if isinstance(val, dict) and "lines" in val:
                pct = val["lines"].get("pct", 0)
                coverage[key] = pct
    except (json.JSONDecodeError, ValueError):
        pass
    return coverage
