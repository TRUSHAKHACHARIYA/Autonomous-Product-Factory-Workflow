from pydantic import BaseModel, Field, model_validator
from app.models.agent_08 import GeneratedFile

REQUIRED_DOCS = {
    "README.md", "docs/api.md", "docs/architecture.md", "docs/database.md",
    "docs/deployment_runbook.md", "docs/onboarding.md", "CHANGELOG.md",
}


class Agent17Output(BaseModel):
    docs: list[GeneratedFile] = Field(min_length=7)

    @model_validator(mode="after")
    def all_required_docs_present(self):
        paths = {d.path for d in self.docs}
        missing = REQUIRED_DOCS - paths
        if missing:
            raise ValueError(f"Missing required documentation files: {missing}")
        return self
