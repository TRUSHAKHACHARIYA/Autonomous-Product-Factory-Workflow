from pydantic import BaseModel, Field
from app.models.agent_08 import GeneratedFile


class HealthCheckEndpoint(BaseModel):
    service: str
    endpoint: str
    expected_response: str


class Agent16Output(BaseModel):
    dockerfiles: list[GeneratedFile] = Field(min_length=2)
    docker_compose: GeneratedFile
    ci_cd_pipeline: GeneratedFile
    terraform_files: list[GeneratedFile] = Field(default_factory=list)
    rollback_strategy: str
    health_check_endpoints: list[HealthCheckEndpoint] = Field(min_length=2)
