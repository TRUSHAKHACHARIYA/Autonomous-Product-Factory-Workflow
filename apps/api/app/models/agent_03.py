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
    related_epic_id: str | None = None


class SprintPlan(BaseModel):
    sprint: int
    task_ids: list[str]
    total_points: int


def find_dependency_cycle(tasks: list[Task]) -> list[str] | None:
    """DFS over depends_on. Returns the cycle path (e.g. ["T-01", "T-02", "T-01"])
    if one exists, else None."""
    graph = {t.id: list(t.depends_on) for t in tasks}
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {tid: WHITE for tid in graph}
    path: list[str] = []

    def visit(nid: str) -> bool:
        color[nid] = GRAY
        path.append(nid)
        for dep in graph[nid]:
            if color[dep] == GRAY:
                path.append(dep)
                return True
            if color[dep] == WHITE and visit(dep):
                return True
        path.pop()
        color[nid] = BLACK
        return False

    for tid in graph:
        if color[tid] == WHITE and visit(tid):
            return path
    return None


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
        epic_ids = {e.id for e in self.epics}
        for epic in self.epics:
            for tid in epic.task_ids:
                if tid not in task_ids:
                    raise ValueError(f"Epic {epic.id} references unknown task {tid}")
        for task in self.tasks:
            for dep in task.depends_on:
                if dep not in task_ids:
                    raise ValueError(f"Task {task.id} depends_on unknown task {dep}")
        for sprint in self.sprint_plan:
            for tid in sprint.task_ids:
                if tid not in task_ids:
                    raise ValueError(f"Sprint {sprint.sprint} references unknown task {tid}")
        for risk in self.risk_register:
            if risk.related_epic_id and risk.related_epic_id not in epic_ids:
                raise ValueError(f"Risk references unknown epic {risk.related_epic_id}")
        return self

    @model_validator(mode="after")
    def validate_no_dependency_cycles(self):
        cycle = find_dependency_cycle(self.tasks)
        if cycle:
            raise ValueError(f"Circular dependency detected: {' -> '.join(cycle)}")
        return self

    @model_validator(mode="after")
    def recompute_sprint_points(self):
        points = {t.id: t.points for t in self.tasks}
        for sprint in self.sprint_plan:
            sprint.total_points = sum(points[tid] for tid in sprint.task_ids)
        return self
