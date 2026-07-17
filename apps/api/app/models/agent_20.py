from typing import Literal
from pydantic import BaseModel, Field


class RealTestResult(BaseModel):
    test_type: str
    total_tests: int
    passed: int
    failed: int
    skipped: int
    duration_seconds: float
    raw_output_excerpt: str


class RealBug(BaseModel):
    id: str
    severity: Literal["Critical", "High", "Medium", "Low"]
    test_type: str
    test_name: str
    file: str
    origin: Literal["frontend", "backend"]
    error_message: str
    stack_trace: str = ""


class SandboxExecutionOutput(BaseModel):
    build_succeeded: bool
    build_error: str = ""
    test_results: list[RealTestResult] = Field(default_factory=list)
    real_bugs: list[RealBug] = Field(default_factory=list)
    real_coverage_percent: dict[str, float] = Field(default_factory=dict)
