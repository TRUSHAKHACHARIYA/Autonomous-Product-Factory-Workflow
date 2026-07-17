import json
from app.agents.base import run_agent_with_approval
from app.agents.prompts.agent_06 import AGENT_06_SYSTEM_PROMPT
from app.agents.artifacts import save_artifact
from app.models.agent_06 import Agent06Output
from app.models.state import PipelineState


async def agent_06_node(state: PipelineState) -> PipelineState:
    input_payload = {
        "requirements": {
            "functional": state.agent_02_output["functional_requirements"],
            "non_functional": state.agent_02_output["non_functional_requirements"],
        },
        "personas": state.agent_02_output["personas"],
        "user_journeys": state.agent_02_output["user_journeys"],
        "tech_stack": state.agent_04_output["tech_stack"],
    }

    result: Agent06Output = await run_agent_with_approval(
        run_id=state.run_id,
        organization_id=state.organization_id,
        agent_name="agent_06_design",
        model="claude-sonnet-5",
        system_prompt=AGENT_06_SYSTEM_PROMPT,
        build_message=lambda notes: json.dumps(input_payload, indent=2) + (
            f"\n\nrevision_notes (mandatory corrections from reviewer):\n{notes}"
            if notes
            else ""
        ),
        output_schema=Agent06Output,
        max_tokens=12000,
    )

    await generate_agent_06_artifacts(state.run_id, result)

    return state.model_copy(
        update={
            "agent_06_output": result.model_dump(),
            "current_agent": "agent_06_design",
            "status": "running",
        }
    )


async def generate_agent_06_artifacts(run_id: str, output: Agent06Output):
    ds = output.design_system
    colors_md = (
        "#### Color Tokens\n"
        "| Token | Value | Usage |\n|---|---|---|\n"
        + "\n".join(
            f"| {c.token} | {c.value} | {c.usage} |" for c in ds.color_tokens
        )
    )
    type_md = (
        "\n\n#### Typography\n"
        "| Role | Font | Size | Weight |\n|---|---|---|---|\n"
        + "\n".join(
            f"| {t.role} | {t.font} | {t.size} | {t.weight} |" for t in ds.typography
        )
    )
    spacing_md = "\n\n#### Spacing Scale\n" + ", ".join(ds.spacing_scale)
    await save_artifact(
        run_id, "agent_06_design", "design_system.md", colors_md + type_md + spacing_md
    )

    components_md = "\n\n".join(
        f"#### {c.name}\n"
        f"- Variants: {', '.join(c.variants)}\n"
        + (f"- Sizes: {', '.join(c.sizes)}\n" if c.sizes else "")
        + f"- States: {', '.join(c.states)}"
        + (f"\n- Notes: {c.notes}" if c.notes else "")
        for c in output.component_specs
    )
    await save_artifact(run_id, "agent_06_design", "component_spec.md", components_md)

    flows_md = "\n\n".join(
        f"#### {f.name}\n" + " → ".join(f.steps) for f in output.user_flows
    )
    await save_artifact(run_id, "agent_06_design", "user_flows.md", flows_md)

    wireframes_md = "\n\n".join(
        f"#### Page: {w.page_name}\n" + "\n".join(f"- {el}" for el in w.elements)
        for w in output.wireframes
    )
    await save_artifact(run_id, "agent_06_design", "wireframes.md", wireframes_md)

    a11y_md = "\n".join(f"- {g}" for g in output.accessibility_guidelines)
    a11y_md += (
        "\n\n#### Responsive Breakpoints\n"
        + "\n".join(f"- {b}" for b in output.responsive_breakpoints)
    )
    await save_artifact(
        run_id, "agent_06_design", "accessibility_guide.md", a11y_md
    )
