from typing import Literal, Optional
from pydantic import BaseModel, Field


class ValidationReport(BaseModel):
    consistency_check_passed: bool
    inconsistencies_found: list[str] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    vague_features_flagged: list[str] = Field(default_factory=list)
    overall_readiness: Literal["READY", "NEEDS_CLARIFICATION"]
    readiness_reason: str = ""


class Agent01Output(BaseModel):
    validated_form: dict
    validation_report: ValidationReport
    clarifying_questions: list[str] = Field(default_factory=list)
