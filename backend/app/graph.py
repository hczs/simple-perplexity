import asyncio
from asyncio import events

from langgraph.graph import StateGraph

from app.graph_constants import NodeNames
from app.nodes import (
    answer_node,
    question_analysis_node,
    researcher_node,
    supervisor_node,
    tool_node,
    tool_router_node,
)
from app.schema import QuestionState
from app.tools import ToolCalledInfo, tool_called_info_parser

graph_builder = StateGraph(QuestionState)

graph_builder.add_node(NodeNames.SUPERVISOR.value, supervisor_node)
graph_builder.add_node(NodeNames.QUESTION_ANALYSIS.value, question_analysis_node)
graph_builder.add_node(NodeNames.RESEARCHER.value, researcher_node)
graph_builder.add_node(NodeNames.TOOL_NODE.value, tool_node)
graph_builder.add_node(NodeNames.TOOL_ROUTER.value, tool_router_node)
graph_builder.add_node(NodeNames.ANSWER.value, answer_node)


graph_builder.set_entry_point(NodeNames.SUPERVISOR.value)
graph_builder.set_finish_point(NodeNames.ANSWER.value)

graph_builder.add_edge(NodeNames.TOOL_NODE.value, NodeNames.TOOL_ROUTER.value)

perplexity_graph = graph_builder.compile()

event_list = []


async def aprint(events):
    async for event in events:
        event_name = event["event"]
        # if event_name not in event_list:
        #     event_list.append(event_name)
        #     print(event)
        #     print("=" * 100)
        if event_name == "on_chat_model_stream":
            # 只打印 answer 节点的输出
            current_node = event["metadata"]["langgraph_node"]
            if current_node == NodeNames.ANSWER.value:
                print(event["data"]["chunk"].content, end="", flush=True)
        if event_name == "on_tool_start":
            called_info: ToolCalledInfo = tool_called_info_parser[event["name"]](event)
            print(f"使用：{called_info.tool_name}: {called_info.tool_called_param}")
        if event_name == "on_tool_end":
            called_info: ToolCalledInfo = tool_called_info_parser[event["name"]](event)
            print(f"{called_info.tool_name} 结果: {called_info.tool_result}")


if __name__ == "__main__":
    with open("graph.png", "wb") as f:
        f.write(perplexity_graph.get_graph().draw_mermaid_png())

    events = perplexity_graph.astream_events(
        input={
            "original_question": "北京明天天气怎么样",
            "messages": [],
            "optimized_question": "",
        }
    )

    asyncio.run(main=aprint(events=events))
