from typing import Literal

from langchain.prompts import MessagesPlaceholder
from langchain.schema import BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph.state import Command

from app.graph_constants import NodeNames
from app.llm import model
from app.schema import QuestionState
from app.tools import current_time, tavily_search_tool
from app.utils import use_tool

tools = [tavily_search_tool, current_time]

system_prompt = """
您是一位信息专家，擅长全面研究。您的职责包括：

1. 根据查询背景确定关键信息需求
2. 从可靠来源收集相关、准确且最新的信息
3. 以结构化、易于理解的格式整理研究结果
4. 在可能的情况下引用来源以增强可信度
5. 专注于信息收集，避免进行分析或实施

注意：如果问题是有关于时效性问题，务必使用**current_time**工具

重要提示：**绝对不要反问用户问题**。在信息缺失的情况下，请提供详尽、客观的回答，避免猜测。
"""

researcher_prompt_template: ChatPromptTemplate = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        (
            "human",
            "用户原始问题：{original_question}\n经过分析优化后的用户问题：{optimized_question}",
        ),
    ],
)


research_model = model.bind_tools(tools=tools)

researcher_chain = researcher_prompt_template | research_model


def researcher_node(
    state: QuestionState,
) -> Command[Literal["tool_node", "supervisor"]]:
    response: BaseMessage = researcher_chain.invoke({**state})
    next_node: Literal["tool_node"] | Literal["supervisor"] = (
        NodeNames.TOOL_NODE.value if use_tool(response) else NodeNames.SUPERVISOR.value
    )
    return Command(
        update={
            "history": [response],
            "messages": [response],
            "pre_node": NodeNames.RESEARCHER.value,
        },
        goto=next_node,
    )


if __name__ == "__main__":
    response = researcher_chain.invoke(
        input={
            "optimized_question": "我每天晚上都睡不着，然后我二姑家的儿子，然后我早上也起不来",
            "messages": [],
        }
    )
    print(response)
