from typing import Literal, Optional
from pydantic import BaseModel, Field


class TechStackEntry(BaseModel):
    layer: str
    technology: str
    why: str


class SystemArchitecture(BaseModel):
    pattern: Literal["Monolith", "Microservices", "Serverless"]
    components: list[str]
    data_flow: str


class AuthStrategy(BaseModel):
    method: str
    access_token_ttl: str
    refresh_token_ttl: str
    oauth_providers: list[str] = Field(default_factory=list)
    password_hashing: str


class EnvironmentConfig(BaseModel):
    dev: str
    staging: str
    prod: str


class Agent04Output(BaseModel):
    tech_stack: list[TechStackEntry] = Field(min_length=1)
    system_architecture: SystemArchitecture
    database_schema_sql: str
    api_contracts_yaml: str
    folder_structure: str
    auth_strategy: AuthStrategy
    caching_strategy: str
    environment_config: EnvironmentConfig


class ApprovalDecision(BaseModel):
    action: Literal["approve", "edit", "reject"]
    edited_output: Optional[dict] = None
    notes: Optional[str] = None
