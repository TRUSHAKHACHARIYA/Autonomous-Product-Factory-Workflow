from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.models.state import PipelineState
from app.config import settings
from app.agents.agent_01 import agent_01_node, route_after_input_layer
from app.agents.agent_02 import agent_02_node
from app.agents.agent_03 import agent_03_node
from app.agents.agent_04 import agent_04_node
from app.agents.agent_05 import agent_05_node
from app.agents.agent_06 import agent_06_node
from app.agents.agent_07 import agent_07_node
from app.agents.agent_08 import agent_08_node
from app.agents.agent_09 import agent_09_node, agent_08_fix_node, route_after_frontend_gate
from app.agents.agent_10 import agent_10_node
from app.agents.agent_11 import agent_11_node
from app.agents.agent_12 import agent_12_node, agent_11_fix_node, route_after_backend_gate
from app.agents.agent_13 import agent_13_node
from app.agents.agent_14 import agent_14_node
from app.agents.agent_20 import agent_20_node
from app.agents.agent_15 import agent_15_node
from app.agents.agent_16 import agent_16_node
from app.agents.agent_17 import agent_17_node
from app.agents.agent_18 import agent_18_node

_checkpointer: AsyncPostgresSaver | None = None
_compiled_graph = None


def build_graph(checkpointer) -> StateGraph:
    graph = StateGraph(PipelineState)
    graph.add_node("agent_01_input_layer", agent_01_node)
    graph.add_node("agent_02_requirement_analyst", agent_02_node)
    graph.add_node("agent_03_project_manager", agent_03_node)
    graph.add_node("agent_04_architecture", agent_04_node)
    graph.add_node("agent_05_security", agent_05_node)
    graph.add_node("agent_06_design", agent_06_node)
    graph.add_node("agent_07_frontend_senior", agent_07_node)
    graph.add_node("agent_08_frontend_junior", agent_08_node)
    graph.add_node("agent_09_frontend_gate", agent_09_node)
    graph.add_node("agent_08_fix", agent_08_fix_node)
    graph.add_node("agent_10_backend_senior", agent_10_node)
    graph.add_node("agent_11_backend_junior", agent_11_node)
    graph.add_node("agent_12_backend_gate", agent_12_node)
    graph.add_node("agent_11_fix", agent_11_fix_node)
    graph.add_node("agent_13_integration", agent_13_node)
    graph.add_node("agent_14_qa", agent_14_node)
    graph.add_node("agent_20_test_executor", agent_20_node)
    graph.add_node("agent_15_fixloop", agent_15_node)
    graph.add_node("agent_16_devops", agent_16_node)
    graph.add_node("agent_17_documentation", agent_17_node)
    graph.add_node("agent_18_final_product", agent_18_node)

    graph.set_entry_point("agent_01_input_layer")
    graph.add_conditional_edges(
        "agent_01_input_layer",
        route_after_input_layer,
        {
            "agent_01_input_layer": "agent_01_input_layer",
            "agent_02_requirement_analyst": "agent_02_requirement_analyst",
        },
    )
    graph.add_edge("agent_02_requirement_analyst", "agent_03_project_manager")
    graph.add_edge("agent_03_project_manager", "agent_04_architecture")
    graph.add_edge("agent_04_architecture", "agent_05_security")
    graph.add_edge("agent_05_security", "agent_06_design")
    graph.add_edge("agent_06_design", "agent_07_frontend_senior")
    graph.add_edge("agent_07_frontend_senior", "agent_08_frontend_junior")
    graph.add_edge("agent_08_frontend_junior", "agent_09_frontend_gate")
    graph.add_conditional_edges(
        "agent_09_frontend_gate",
        route_after_frontend_gate,
        {
            "agent_10_backend_senior": "agent_10_backend_senior",
            "agent_08_fix": "agent_08_fix",
        },
    )
    graph.add_edge("agent_08_fix", "agent_09_frontend_gate")
    graph.add_edge("agent_10_backend_senior", "agent_11_backend_junior")
    graph.add_edge("agent_11_backend_junior", "agent_12_backend_gate")
    graph.add_conditional_edges(
        "agent_12_backend_gate",
        route_after_backend_gate,
        {
            "agent_13_integration": "agent_13_integration",
            "agent_11_fix": "agent_11_fix",
        },
    )
    graph.add_edge("agent_11_fix", "agent_12_backend_gate")
    graph.add_edge("agent_13_integration", "agent_14_qa")
    graph.add_edge("agent_14_qa", "agent_20_test_executor")
    graph.add_edge("agent_20_test_executor", "agent_15_fixloop")
    graph.add_edge("agent_15_fixloop", "agent_16_devops")
    graph.add_edge("agent_16_devops", "agent_17_documentation")
    graph.add_edge("agent_17_documentation", "agent_18_final_product")
    graph.add_edge("agent_18_final_product", END)
    return graph.compile(checkpointer=checkpointer)


async def init_graph():
    global _checkpointer, _compiled_graph
    _checkpointer = AsyncPostgresSaver.from_conn_string(settings.DATABASE_URL)
    await _checkpointer.__aenter__()
    await _checkpointer.setup()
    _compiled_graph = build_graph(_checkpointer)


def get_compiled_graph():
    if _compiled_graph is None:
        raise RuntimeError("Graph not initialized — call init_graph() at startup")
    return _compiled_graph
