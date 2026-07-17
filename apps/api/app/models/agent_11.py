from pydantic import BaseModel, Field
from app.models.agent_08 import GeneratedFile   # reused as-is — identical shape (path + content)


class ModuleCodeOutput(BaseModel):   # structurally identical to Phase 8's, kept separate for
    module_name: str                  # clarity of which agent produced it in agent_outputs
    files: list[GeneratedFile] = Field(min_length=1)


class Agent11Output(BaseModel):
    modules: list[ModuleCodeOutput] = Field(min_length=1)
