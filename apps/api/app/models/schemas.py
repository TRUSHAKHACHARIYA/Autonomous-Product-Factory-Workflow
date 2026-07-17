from typing import Optional, Literal
from pydantic import BaseModel


class RunCreate(BaseModel):
    product_idea: str


class RunResponse(BaseModel):
    id: str
    organization_id: str
    created_by: str
    product_idea: str
    status: str
    current_agent: Optional[str] = None
    langgraph_thread_id: str
    error: Optional[str] = None
    created_at: str
    updated_at: str


class AgentOutputResponse(BaseModel):
    id: str
    run_id: str
    agent_name: str
    status: str
    structured_output: Optional[dict] = None
    markdown_output: Optional[str] = None
    model_used: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    cost_usd: Optional[float] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    created_at: str


class OrgCreate(BaseModel):
    name: str
    slug: str


class OrgResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    created_at: str
