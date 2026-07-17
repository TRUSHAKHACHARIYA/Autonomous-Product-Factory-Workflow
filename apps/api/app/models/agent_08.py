from pydantic import BaseModel, Field


class GeneratedFile(BaseModel):
    path: str
    content: str


class ModuleCodeOutput(BaseModel):
    module_name: str
    files: list[GeneratedFile] = Field(min_length=1)


class Agent08Output(BaseModel):
    modules: list[ModuleCodeOutput] = Field(min_length=1)
