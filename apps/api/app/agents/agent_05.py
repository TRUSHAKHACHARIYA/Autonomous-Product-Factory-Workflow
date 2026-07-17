import json
from app.agents.base import run_agent
from app.agents.prompts.agent_05 import AGENT_05_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_05 import Agent05Output
from app.models.state import PipelineState


async def agent_05_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "system_architecture": state.agent_04_output["system_architecture"],
        "api_contracts_yaml": state.agent_04_output["api_contracts_yaml"],
        "auth_strategy": state.agent_04_output["auth_strategy"],
        "requirements": {
            "functional": state.agent_02_output["functional_requirements"],
            "non_functional": state.agent_02_output["non_functional_requirements"],
        },
    }

    result: Agent05Output = await run_agent(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_05_security",
        model="claude-sonnet-5",
        system_prompt=AGENT_05_SYSTEM_PROMPT,
        user_message=json.dumps(input_payload, indent=2),
        output_schema=Agent05Output,
    )

    await generate_agent_05_artifacts(state.run_id, result)

    return state.model_copy(
        update={
            "agent_05_output": result.model_dump(),
            "current_agent": "agent_05_security",
            "status": "running",
        }
    )


async def generate_agent_05_artifacts(run_id: str, output: Agent05Output):
    owasp_md = (
        "#### OWASP Top 10 Review\n"
        "| Risk | Status | Mitigation |\n|---|---|---|\n"
        + "\n".join(
            f"| {e.risk_id} {e.risk_name} "
            f"| {'✅' if e.status == 'Covered' else '⚠️' if e.status == 'Risk' else '➖'} {e.status} "
            f"| {e.mitigation} |"
            for e in output.owasp_review
        )
    )
    security_audit_md = (
        owasp_md
        + f"\n\n#### Auth Audit\n{output.auth_audit_notes}"
        + f"\n\n#### Encryption Requirements\n{output.encryption_requirements}"
    )
    await save_artifact(
        run_id, "agent_05_security", "security_audit.md", security_audit_md
    )

    checklist_md = (
        "All dev agents must follow these rules:\n"
        + "\n".join(f"- [ ] {item}" for item in output.security_checklist)
        + "\n\n#### Input Validation Rules\n"
        + "\n".join(f"- {r}" for r in output.input_validation_rules)
    )
    await save_artifact(
        run_id, "agent_05_security", "security_checklist.md", checklist_md
    )

    c = output.compliance_requirements
    compliance_md = (
        f"- GDPR applicable: {c.gdpr_applicable}\n"
        + (
            "\n".join(f"- {r}" for r in c.gdpr_requirements) + "\n"
            if c.gdpr_requirements
            else ""
        )
        + f"- Data retention: {c.data_retention_days} days\n"
        + f"- PII fields: {', '.join(c.pii_fields) or 'None identified'}\n"
        + f"- PII encryption: {c.pii_encryption_notes}"
    )
    await save_artifact(
        run_id, "agent_05_security", "compliance_requirements.md", compliance_md
    )

    s = output.secrets_management
    secrets_md = f"- Tool: {s.tool}\n- Rotation: {s.rotation_policy}\n- Notes: {s.notes}"
    await save_artifact(
        run_id, "agent_05_security", "secrets_management.md", secrets_md
    )
