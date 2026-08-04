from types import SimpleNamespace

from app.models.agent_02 import (
    Agent02Output,
    ComplexityScore,
    FunctionalRequirement,
    NonFunctionalRequirement,
    Persona,
    UserJourney,
)
from app.models.agent_03 import (
    Agent03Output,
    Epic,
    EpicAcceptanceCriteria,
    MvpScope,
    RiskEntry,
    SprintPlan,
    Task,
    TimelineMilestone,
)


# ---------------------------------------------------------------- onboarding


def sample_validated_form(**overrides):
    data = {
        "project_name": "Pet Tracker",
        "one_liner": "A mobile app for dog owners to track walks and vet visits",
        "platform": "Mobile",
        "target_audience": "Dog owners aged 20-50",
        "problem_statement": "Dog owners lose track of vaccination schedules and exercise goals",
        "must_have_features": [
            "users can log walks with duration and distance",
            "users can store vet visit dates and upcoming vaccinations",
            "users get reminders for vaccinations",
        ],
        "nice_to_have_features": ["share walks to social media"],
        "tech_preferences": ["React Native"],
        "integration_requirements": ["Google Calendar"],
        "compliance_requirements": [],
        "budget_range": "$5k-$20k",
        "timeline": "1-3 months",
        "team_context": None,
    }
    data.update(overrides)
    return data


def sample_validation_report(**overrides):
    data = {
        "consistency_check_passed": True,
        "inconsistencies_found": [],
        "missing_fields": [],
        "vague_features_flagged": [],
        "overall_readiness": "READY",
        "readiness_reason": "form is clear",
    }
    data.update(overrides)
    return data


def sample_agent01_output(**overrides):
    output = {
        "validated_form": sample_validated_form(),
        "validation_report": sample_validation_report(),
    }
    output.update(overrides)
    return output


# ---------------------------------------------------------------- agent 02


def sample_agent02_output() -> Agent02Output:
    return Agent02Output(
        functional_requirements=[
            FunctionalRequirement(id="FR-01", description="Log a walk with duration and distance"),
            FunctionalRequirement(id="FR-02", description="Store vet visit dates and vaccination records"),
            FunctionalRequirement(id="FR-03", description="Send vaccination reminder notifications"),
        ],
        non_functional_requirements=[
            NonFunctionalRequirement(id="NFR-01", category="Performance", description="app launches in under 2s"),
            NonFunctionalRequirement(id="NFR-02", category="Security", description="health data encrypted at rest"),
            NonFunctionalRequirement(id="NFR-03", category="Reliability", description="reminders delivered within 1 minute"),
        ],
        personas=[
            Persona(name="Ana", role="Dog owner", goal="Track walks", pain_point="loses paper records", tech_comfort="Medium"),
            Persona(name="Diego", role="Vet clinic admin", goal="see vaccine history", pain_point="patients miss vaccines", tech_comfort="Low"),
        ],
        user_journeys=[
            UserJourney(name="Log a walk", steps=["Open app", "Start walk", "End walk", "Goal achieved"]),
            UserJourney(name="Book a vet visit", steps=["Open calendar", "Pick date", "Confirm", "Goal achieved"]),
            UserJourney(name="Get a reminder", steps=["Enable notifications", "Receive reminder", "Goal achieved"]),
        ],
        ambiguities=[],
        complexity_score=ComplexityScore(score="S", reason="small consumer app"),
    )


# ---------------------------------------------------------------- agent 03


def sample_agent03_output() -> Agent03Output:
    return Agent03Output(
        epics=[
            Epic(
                id="EP-01",
                name="Walks",
                user_story="As Ana, I want to log walks so I can track my dog's exercise",
                task_ids=["T-01", "T-02"],
                story_points=8,
                sprint=1,
            ),
        ],
        tasks=[
            Task(id="T-01", epic_id="EP-01", title="Walk logging screen", points=3, sprint=1, depends_on=[]),
            Task(id="T-02", epic_id="EP-01", title="Walk storage API", points=5, sprint=1, depends_on=["T-01"]),
        ],
        mvp_scope=MvpScope(
            in_mvp=["walk logging", "vet visit records", "vaccination reminders"],
            in_v2=["social sharing"],
        ),
        timeline=[TimelineMilestone(milestone="Alpha", sprint=1, deliverable="walk logging works end-to-end")],
        acceptance_criteria=[
            EpicAcceptanceCriteria(epic_id="EP-01", criteria=["Given a logged walk, the duration and distance are saved"]),
        ],
        risk_register=[RiskEntry(risk="Calendar API rate limits", probability="Medium", impact="High", mitigation="queue reminder jobs")],
        sprint_plan=[SprintPlan(sprint=1, task_ids=["T-01", "T-02"], total_points=8)],
    )


# ------------------------------------------------------- external mocks

class FakeQuery:
    def __init__(self):
        self.updates = []
        self.upserts = []

    def upsert(self, data, on_conflict=None):
        self.upserts.append(("upsert", data, on_conflict))
        return self

    def update(self, data):
        self.updates.append(("update", data))
        return self

    def insert(self, data):
        self.updates.append(("insert", data))
        return self

    def select(self, *args):
        return self

    def eq(self, *args):
        return self

    def single(self):
        return self

    def execute(self):
        return SimpleNamespace(data=[], count=0)


class FakeSupabase:
    def __init__(self):
        self.queries = {}

    def table(self, name):
        if name not in self.queries:
            self.queries[name] = FakeQuery()
        return self.queries[name]


def make_response(tool_input, input_tokens=10, output_tokens=20):
    return SimpleNamespace(
        content=[
            SimpleNamespace(
                type="tool_use",
                id="toolu_1",
                name="emit_output",
                input=tool_input,
            )
        ],
        usage=SimpleNamespace(input_tokens=input_tokens, output_tokens=output_tokens),
    )
