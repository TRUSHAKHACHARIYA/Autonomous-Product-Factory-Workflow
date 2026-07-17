from typing import Literal
from pydantic import BaseModel, Field, model_validator

OWASP_IDS = {f"A{i:02d}" for i in range(1, 11)}


class OwaspReviewEntry(BaseModel):
    risk_id: str
    risk_name: str
    status: Literal["Covered", "Risk", "Not Applicable"]
    mitigation: str


class ComplianceRequirements(BaseModel):
    gdpr_applicable: bool
    gdpr_requirements: list[str] = Field(default_factory=list)
    data_retention_days: int
    pii_fields: list[str] = Field(default_factory=list)
    pii_encryption_notes: str


class SecretsManagement(BaseModel):
    tool: str
    rotation_policy: str
    notes: str


class Agent05Output(BaseModel):
    owasp_review: list[OwaspReviewEntry] = Field(min_length=10, max_length=10)
    auth_audit_notes: str
    encryption_requirements: str
    input_validation_rules: list[str] = Field(min_length=1)
    security_checklist: list[str] = Field(min_length=5)
    compliance_requirements: ComplianceRequirements
    secrets_management: SecretsManagement

    @model_validator(mode="after")
    def validate_owasp_coverage(self):
        ids = {e.risk_id for e in self.owasp_review}
        if ids != OWASP_IDS:
            missing = OWASP_IDS - ids
            raise ValueError(
                f"OWASP review must cover all 10 risks. Missing: {missing}"
            )
        return self
