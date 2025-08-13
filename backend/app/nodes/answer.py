from langchain.prompts import MessagesPlaceholder
from langchain_core.prompts import ChatPromptTemplate

from app.llm import model
from app.schema import QuestionState

system_prompt = """
你是一位问题解答专家，你擅长根据上下文信息和用户的问题，来完美的帮用户解决问题

你的职责包括:
1. 根据用户的问题，为用户提供有理有据的答案，要在答案中标注引用来源（来源 URL 以及其他出处）
2. 你的回答要直击问题关键点
3. 给出的参考链接或者内容必须是从上下文中获取到的，而不是你自己的猜测推算

输出格式：
分为两部分，一部分是你的回答，一部分是你的引用来源（可以是多个）

输出样例：
鲁迅原名周树人，浙江绍兴人。
参考：
2.xxx：https://www.example.com

重要提示：**绝对不要反问用户问题**。请提供详尽、客观的回答，避免猜测。
"""

answer_prompt_template: ChatPromptTemplate = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        (
            "human",
            "用户原始问题：{original_question}\n经过分析优化后的用户问题：{optimized_question}",
        ),
    ],
)

answer_model = model

answer_chain = answer_prompt_template | answer_model


def answer_node(state: QuestionState):
    answer_result = answer_chain.invoke({**state})
    return {"messages": [answer_result]}
