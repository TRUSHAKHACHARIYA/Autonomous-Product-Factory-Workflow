from typing import Literal, Optional
from pydantic import BaseModel, Field


class OnboardingFormData(BaseModel):
    project_name: str
    one_liner: str
    platform: Literal["Web", "Mobile", "API", "All"]
    target_audience: str
    problem_statement: str
    must_have_features: list[str] = Field(min_length=1)
    nice_to_have_features: list[str] = Field(default_factory=list)
    tech_preferences: list[str] = Field(default_factory=list)
    integration_requirements: list[str] = Field(default_factory=list)
    compliance_requirements: list[str] = Field(default_factory=list)
    budget_range: Optional[Literal["<$5k", "$5k-$20k", "$20k-$100k", ">$100k", "Not sure"]] = None
    timeline: Optional[Literal["ASAP (<1 month)", "1-3 months", "3-6 months", "6+ months", "Not sure"]] = None
    team_context: Optional[str] = None
