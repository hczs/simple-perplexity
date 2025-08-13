from typing import AsyncIterator

from fastapi.responses import StreamingResponse
from fastapi.routing import APIRouter
from langchain_core.runnables.schema import CustomStreamEvent, StandardStreamEvent

from app.graph import perplexity_graph, tool_called_info_parser
from app.graph_constants import NodeNames
from app.schema import ChatRequest, ChatResponse, ToolResponse
from app.tools import ToolCalledInfo

router = APIRouter(
    prefix="/api",
    tags=["API"],
    responses={404: {"description": "Not found"}},
)


async def handle_events(events):
    async for event in events:
        event_name = event["event"]
        if (
            event_name == "on_chat_model_stream"
            and event["metadata"]["langgraph_node"] == NodeNames.ANSWER.value
        ):
            # 只返回 answer 的数据
            yield f"data: {ChatResponse(content=event['data']['chunk'].content).model_dump_json()}\n\n"
        if event_name == "on_tool_start":
            called_info: ToolCalledInfo = tool_called_info_parser[event["name"]](event)
            yield f"data: {ToolResponse(tool_name=called_info.tool_name, tool_param=called_info.tool_called_param, tool_result=called_info.tool_result).model_dump_json()}\n\n"
        if event_name == "on_tool_end":
            called_info: ToolCalledInfo = tool_called_info_parser[event["name"]](event)
            yield f"data: {ToolResponse(tool_name=called_info.tool_name, tool_param=called_info.tool_called_param, tool_result=called_info.tool_result).model_dump_json()}\n\n"


@router.get("/")
async def root():
    return {"message": "Hello World"}


@router.post("/chat")
async def chat(chat_request: ChatRequest) -> StreamingResponse:
    events: AsyncIterator[StandardStreamEvent | CustomStreamEvent] = (
        perplexity_graph.astream_events(
            input={
                "original_question": chat_request.question,
                "messages": [],
                "optimized_question": "",
            }
        )
    )
    return StreamingResponse(
        content=handle_events(events), media_type="text/event-stream"
    )
