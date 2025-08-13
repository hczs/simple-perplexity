from typing import Literal, cast

from langchain.prompts import MessagesPlaceholder
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph.state import Command

from app.llm import model
from app.schema import QuestionState, SuperVisorResult

system_prompt = """
你是一名 工作流监督者，负责管理一个由三名专业代理组成的团队：提示词优化师、研究员 和 程序员。
你的职责是根据任务的当前状态和需求，选择最合适的下一个代理来执行任务，并为每次决策提供清晰、简洁的理由，以确保决策过程透明。

团队成员：

问题分析师（question_analysis）：始终首先考虑这个代理。他们负责澄清含糊的请求、改进定义不清的查询，并在深入处理之前确保任务结构清晰合理。

研究员（researcher）：专注于信息收集、事实查证以及获取满足用户需求的相关数据。

问题解答专家（answer）：专注于根据上下文信息和用户的问题，给用户准确的答案，并在答案中标注引用来源。

你的职责：

分析每个用户请求和代理回复的完整性、准确性和相关性。

在每个决策点，将任务分配给最合适的代理。

保持工作流的高效运转，避免重复和不必要的代理调用。

持续处理，直到用户的请求被完整且令人满意地解决。

你的目标：
创建一个高效的工作流，充分发挥每个代理的优势，同时减少不必要的步骤，最终为用户提供完整且准确的解决方案。
"""

supervisor_prompt_template: ChatPromptTemplate = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        ("human", "用户问题：{original_question}"),
    ],
)


supervisor_model = model.with_structured_output(SuperVisorResult)


supervisor_chain = supervisor_prompt_template | supervisor_model


def supervisor_node(
    state: QuestionState,
) -> Command[Literal["question_analysis", "researcher", "answer"]]:
    response: SuperVisorResult = cast(
        SuperVisorResult, supervisor_chain.invoke({**state})
    )
    return Command(
        update={
            "messages": [HumanMessage(content=response.reason, name="supervisor")],
        },
        goto=response.next,
    )
