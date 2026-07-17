from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.state import PipelineState


def get_security_checklist_text(state: "PipelineState") -> str:
    if not state.agent_05_output:
        return ""
    items = state.agent_05_output["security_checklist"]
    return (
        "MANDATORY SECURITY RULES (from Security Agent — violating any of these is a failed task):\n"
        + "\n".join(f"- {item}" for item in items)
    )
