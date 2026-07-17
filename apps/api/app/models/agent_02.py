from typing import Literal
from pydantic import BaseModel, Field


class FunctionalRequirement(BaseModel):
    id: str
    description: str


class NonFunctionalRequirement(BaseModel):
    id: str
    category: Literal["Performance", "Security", "Scalability", "Reliability", "Usability", "Other"]
    description: str


class Persona(BaseModel):
    name: str
    role: str
    goal: str
    pain_point: str
    tech_comfort: Literal["Low", "Medium", "High"]


class UserJourney(BaseModel):
    name: str
    steps: list[str]


class Ambiguity(BaseModel):
    ambiguity: str
    resolution: str


class ComplexityScore(BaseModel):
    score: Literal["S", "M", "L", "XL"]
    reason: str


class Agent02Output(BaseModel):
    functional_requirements: list[FunctionalRequirement] = Field(min_length=1)
    non_functional_requirements: list[NonFunctionalRequirement] = Field(min_length=1)
    personas: list[Persona] = Field(min_length=2, max_length=3)
    user_journeys: list[UserJourney] = Field(min_length=3, max_length=5)
    ambiguities: list[Ambiguity] = Field(default_factory=list)
    complexity_score: ComplexityScore
