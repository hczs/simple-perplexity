import operator
from typing import Annotated, Literal, TypedDict

from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field


class QuestionState(TypedDict):
    original_question: str
    optimized_question: str
    # 必须叫 messages，因为 toolnode 执行是找的这个字段
    messages: Annotated[list[BaseMessage], operator.concat]
    pre_node: str


class QuestionAnalysisResult(BaseModel):
    optimized_question: str = Field(description="经过分析优化后的问题")


class SuperVisorResult(BaseModel):
    next: Literal["question_analysis", "researcher", "answer"] = Field(
        description="下一步执行的节点名称（question_analysis，researcher，answer）"
    )
    reason: str = Field(description="选择该节点作为下一步执行节点的原因说明")


class ToolCalledInfo(BaseModel):
    tool_name: str
    tool_called_param: str
    tool_result: str


# api
class ChatRequest(BaseModel):
    question: str


# event response
class ChatResponse(BaseModel):
    event_name: str = "chat_event"
    content: str


class ToolResponse(BaseModel):
    event_name: str = "tool_event"
    tool_name: str
    tool_param: str
    tool_result: str
