from typing import Literal
from pydantic import BaseModel, Field, model_validator


class FileReviewResult(BaseModel):
    file: str
    status: Literal["Pass", "Fail"]
    issues: str = "none"


class FixTask(BaseModel):
    id: str                  # "ISSUE-BE-01"
    severity: Literal["Critical", "High", "Medium", "Low"]
    file: str
    line: int | None = None
    fix: str


class ModuleReviewOutput(BaseModel):
    module_name: str
    module_result: Literal["Pass", "Fail"]
    file_reviews: list[FileReviewResult] = Field(min_length=1)
    fix_tasks: list[FixTask] = Field(default_factory=list)

    @model_validator(mode="after")
    def fail_requires_fix_tasks(self):
        if self.module_result == "Fail" and not self.fix_tasks:
            raise ValueError("module_result is Fail but no fix_tasks were provided")
        return self


class Agent12Output(BaseModel):
    overall_result: Literal["PASS", "FAIL"]
    module_reviews: list[ModuleReviewOutput] = Field(min_length=1)

    @model_validator(mode="after")
    def overall_matches_modules(self):
        all_pass = all(m.module_result == "Pass" for m in self.module_reviews)
        expected = "PASS" if all_pass else "FAIL"
        if self.overall_result != expected:
            raise ValueError(f"overall_result should be {expected} given module results")
        return self
