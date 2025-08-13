from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    # LLM
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_base_url: str = Field(
        default="https://api.siliconflow.cn/v1", alias="OPENAI_BASE_URL"
    )
    model_name: str = Field(default="moonshotai/Kimi-K2-Instruct", alias="MODEL_NAME")

    # Tavily Search
    tavily_api_key: str = Field(default="", alias="TAVILY_API_KEY")

    # 配置来源：.env 文件
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


appConfig = AppConfig()
