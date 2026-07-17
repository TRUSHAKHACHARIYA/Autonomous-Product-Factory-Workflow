MODEL_ROUTING = {
    "agent_01_input_layer": "claude-haiku-4-5-20251001",
    "agent_02_requirement_analyst": "claude-sonnet-5",
    "agent_03_project_manager": "claude-sonnet-5",
    "agent_04_architecture": "claude-sonnet-5",
    "agent_05_security": "claude-sonnet-5",
    "agent_06_design": "claude-sonnet-5",
    "agent_07_frontend_senior": "claude-sonnet-5",
    "agent_08_frontend_junior": "claude-sonnet-5",
    "agent_09_frontend_gate": "claude-sonnet-5",
    "agent_10_backend_senior": "claude-sonnet-5",
    "agent_11_backend_junior": "claude-sonnet-5",
    "agent_12_backend_gate": "claude-sonnet-5",
    "agent_13_integration": "claude-sonnet-5",
    "agent_14_qa": "claude-sonnet-5",
    "agent_15_fixloop": "claude-sonnet-5",
    "agent_16_devops": "claude-sonnet-5",
    "agent_17_documentation": "claude-haiku-4-5-20251001",
    "agent_18_final_product": "claude-haiku-4-5-20251001",
}

MODEL_PRICING = {
    "claude-haiku-4-5-20251001": {"input": 1.00, "output": 5.00},
    "claude-sonnet-5": {"input": 3.00, "output": 15.00},
}


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    pricing = MODEL_PRICING.get(model)
    if not pricing:
        return 0.0
    return round(
        (input_tokens / 1_000_000) * pricing["input"]
        + (output_tokens / 1_000_000) * pricing["output"],
        4,
    )
