from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from app.config import appConfig


def get_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model=appConfig.model_name,
        base_url=appConfig.openai_base_url,
        api_key=SecretStr(appConfig.openai_api_key),
    )


model: ChatOpenAI = get_llm()
