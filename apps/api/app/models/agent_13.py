from typing import Literal
from pydantic import BaseModel, Field
from app.models.agent_08 import GeneratedFile


class APIConnection(BaseModel):
    frontend_call: str
    backend_endpoint: str
    status: Literal["Connected", "Mismatch", "Missing"]


class Mismatch(BaseModel):
    id: str
    description: str
    fix: str


class EnvConfigFile(BaseModel):
    filename: str
    content: str


class MockDataRemoval(BaseModel):
    file: str
    description: str


class Agent13Output(BaseModel):
    api_connections: list[APIConnection] = Field(min_length=1)
    mismatches: list[Mismatch] = Field(default_factory=list)
    api_client_files: list[GeneratedFile] = Field(min_length=1)
    env_configs: list[EnvConfigFile] = Field(min_length=2)
    mock_data_removed: list[MockDataRemoval] = Field(default_factory=list)
