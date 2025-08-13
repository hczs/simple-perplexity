from langgraph.graph.state import Command

from app.schema import QuestionState


def tool_router_node(state: QuestionState):
    return Command(goto=state["pre_node"])
