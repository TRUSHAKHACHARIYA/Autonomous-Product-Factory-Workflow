from typing import Literal
from pydantic import BaseModel, Field, model_validator


StoryPoints = Literal[1, 2, 3, 5, 8, 13]


class Epic(BaseModel):
    id: str
    name: str
    user_story: str
    task_ids: list[str]
    story_points: StoryPoints
    sprint: int


class Task(BaseModel):
    id: str
    epic_id: str
    title: str
    points: StoryPoints
    sprint: int
    depends_on: list[str] = Field(default_factory=list)


class MvpScope(BaseModel):
    in_mvp: list[str]
    in_v2: list[str]


class TimelineMilestone(BaseModel):
    milestone: str
    sprint: int
    deliverable: str


class EpicAcceptanceCriteria(BaseModel):
    epic_id: str
    criteria: list[str]


class RiskEntry(BaseModel):
    risk: str
    probability: Literal["Low", "Medium", "High"]
    impact: Literal["Low", "Medium", "High"]
    mitigation: str


class SprintPlan(BaseModel):
    sprint: int
    task_ids: list[str]
    total_points: int


class Agent03Output(BaseModel):
    epics: list[Epic] = Field(min_length=1)
    tasks: list[Task] = Field(min_length=1)
    mvp_scope: MvpScope
    timeline: list[TimelineMilestone] = Field(min_length=1)
    acceptance_criteria: list[EpicAcceptanceCriteria] = Field(min_length=1)
    risk_register: list[RiskEntry] = Field(default_factory=list)
    sprint_plan: list[SprintPlan] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_task_references(self):
        task_ids = {t.id for t in self.tasks}
        for epic in self.epics:
            for tid in epic.task_ids:
                if tid not in task_ids:
                    raise ValueError(f"Epic {epic.id} references unknown task {tid}")
        for task in self.tasks:
            for dep in task.depends_on:
                if dep not in task_ids:
                    raise ValueError(f"Task {task.id} depends_on unknown task {dep}")
        return self
