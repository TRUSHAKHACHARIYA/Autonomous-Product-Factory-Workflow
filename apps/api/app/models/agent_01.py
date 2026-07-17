from typing import Literal, Optional
from pydantic import BaseModel, Field


class UserInputJSON(BaseModel):
    project_name: str
    description: str
    platform: Literal["Web", "Mobile", "API", "All"]
    tech_preferences: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    budget: Optional[str] = None
    timeline: Optional[str] = None
    missing_info: list[str] = Field(default_factory=list)
    clarifying_questions: list[str] = Field(default_factory=list)


class ValidationReport(BaseModel):
    project_name_present: bool
    description_present: bool
    platform_identified: bool
    overall_readiness: Literal["READY", "NEEDS_CLARIFICATION"]
    readiness_reason: str = ""


class Agent01Output(BaseModel):
    user_input: UserInputJSON
    validation_report: ValidationReport
    clarification_round: int = 0
    clarification_history: list[dict] = Field(default_factory=list)
    pending_questions: list[str] = Field(default_factory=list)
    pending_readiness_reason: str = ""
