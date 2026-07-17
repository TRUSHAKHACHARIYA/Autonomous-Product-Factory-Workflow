from pydantic import BaseModel, Field


class ChecklistItem(BaseModel):
    category: str
    item: str
    completed: bool


class Agent18Output(BaseModel):
    project_summary: str
    delivery_checklist: list[ChecklistItem] = Field(min_length=1)
    next_steps: list[str] = Field(min_length=1)
