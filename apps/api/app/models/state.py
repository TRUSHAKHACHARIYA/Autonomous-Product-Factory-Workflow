from typing import Optional, Literal
from pydantic import BaseModel, Field

AgentName = Literal[
    "agent_01_input_layer", "agent_02_requirement_analyst", "agent_03_project_manager",
    "agent_04_architecture", "agent_05_security", "agent_06_design",
    "agent_07_frontend_senior", "agent_08_frontend_junior", "agent_09_frontend_gate",
    "agent_10_backend_senior", "agent_11_backend_junior", "agent_12_backend_gate",
    "agent_13_integration", "agent_14_qa", "agent_15_fixloop",
    "agent_16_devops", "agent_17_documentation", "agent_18_final_product",
    "agent_20_test_executor",
]


class PipelineState(BaseModel):
    run_id: str
    organization_id: str
    product_idea: str
    status: Literal["pending", "running", "awaiting_approval", "awaiting_clarification", "completed", "failed"] = "pending"
    current_agent: Optional[AgentName] = None
    error: Optional[str] = None

    agent_01_output: Optional[dict] = None
    agent_02_output: Optional[dict] = None
    agent_03_output: Optional[dict] = None
    agent_04_output: Optional[dict] = None
    agent_05_output: Optional[dict] = None
    agent_06_output: Optional[dict] = None
    agent_07_output: Optional[dict] = None
    agent_08_output: Optional[dict] = None
    agent_09_output: Optional[dict] = None
    agent_10_output: Optional[dict] = None
    agent_11_output: Optional[dict] = None
    agent_12_output: Optional[dict] = None
    agent_13_output: Optional[dict] = None
    agent_14_output: Optional[dict] = None
    agent_14_bugs: list[dict] = Field(default_factory=list)
    agent_15_output: Optional[dict] = None

    fe_gate_cycle: int = 0
    be_gate_cycle: int = 0

    clarification_round: int = 0
    clarification_history: list[dict] = Field(default_factory=list)

    class Config:
        extra = "allow"
