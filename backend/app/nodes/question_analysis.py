from typing import Literal, cast

from langchain.prompts import MessagesPlaceholder
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langgraph.graph.state import Command

from app.graph_constants import NodeNames
from app.llm import model
from app.schema import QuestionAnalysisResult, QuestionState

system_prompt = """
你是一位查询优化专家，擅长将模糊的请求转化为明确的指令。你的职责包括：

1. 分析原始查询，以识别其核心意图和需求  
2. 在不向用户额外提问的前提下，解决其中的任何歧义  
3. 对查询中表述不清或不完整的部分，基于合理假设进行补充完善  
4. 重构查询，使其更加清晰、具备可执行性  
5. 确保所有技术术语在上下文中被正确地定义和解释
6. 注意：不要过度分析原始问题，只需要将原始问题更加具体一些即可，不要长篇大论
7. 注意：不要对问题添加你的猜测，不要添加你不清楚的东西，尤其是时效性的内容比如说时间、日期等等

重要提示：**绝对不要反问用户问题**。请根据已有内容进行合理假设，并尽可能生成最完整、最严谨的请求版本。
"""

prompt_template: ChatPromptTemplate = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        ("human", "原始问题：{original_question}"),
    ],
)


def cast_obj(result) -> QuestionAnalysisResult:
    return cast(QuestionAnalysisResult, result)


question_model = model.with_structured_output(QuestionAnalysisResult)

question_analysis_chain = prompt_template | question_model | RunnableLambda(cast_obj)


def question_analysis_node(state: QuestionState) -> Command[Literal["supervisor"]]:
    """分析用户问的问题，使得问题更加的清晰

    Args:
        state (QuestionState): state
    """
    response: QuestionAnalysisResult = question_analysis_chain.invoke(input={**state})

    return Command(
        update={
            "optimized_question": response.optimized_question,
            "messages": [
                HumanMessage(content=f"优化后的问题是：{response.optimized_question}")
            ],
        },
        goto=NodeNames.SUPERVISOR.value,
    )
