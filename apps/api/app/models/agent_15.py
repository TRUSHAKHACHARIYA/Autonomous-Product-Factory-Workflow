from typing import Literal
from pydantic import BaseModel, Field
from app.models.agent_08 import GeneratedFile


class FixAttempt(BaseModel):
    attempt_number: int
    approach_notes: str
    fixed_file: GeneratedFile
    self_assessed_resolved: bool
    sandbox_retest_passed: bool = False
    sandbox_retest_error: str = ""
    explanation: str


class BugFixResult(BaseModel):
    bug_id: str
    status: Literal["RESOLVED", "ESCALATED", "SKIPPED_FILE_NOT_FOUND"]
    attempts: list[FixAttempt] = Field(default_factory=list)
    root_cause: str = ""
    final_fix_summary: str = ""
    escalation_reason: str | None = None


class Agent15Output(BaseModel):
    fix_results: list[BugFixResult] = Field(min_length=1)
    v2_backlog: list[dict] = Field(default_factory=list)
