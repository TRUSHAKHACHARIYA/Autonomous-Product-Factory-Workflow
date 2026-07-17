from typing import Literal
from pydantic import BaseModel, Field
from app.models.agent_08 import GeneratedFile


TestType = Literal[
    "Unit", "Integration", "E2E", "Performance",
    "Accessibility", "Security", "CrossBrowser", "Regression",
]


class Bug(BaseModel):
    id: str
    severity: Literal["Critical", "High", "Medium", "Low"]
    title: str
    steps_to_reproduce: str
    expected: str
    actual: str
    file: str
    module: str
    origin: Literal["frontend", "backend"]


class CoverageEstimate(BaseModel):
    module: str
    estimated_coverage_percent: int


class TestTypeOutput(BaseModel):
    test_type: TestType
    files: list[GeneratedFile] = Field(min_length=1)
    bugs_found: list[Bug] = Field(default_factory=list)
    coverage_estimates: list[CoverageEstimate] = Field(default_factory=list)
    notes: str = ""


class Agent14Output(BaseModel):
    test_type_results: list[TestTypeOutput] = Field(min_length=8, max_length=8)
