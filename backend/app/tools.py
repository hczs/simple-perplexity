import json
from datetime import datetime

from langchain_community.tools import tool
from langchain_tavily import TavilySearch

from app.llm import appConfig
from app.schema import ToolCalledInfo

# 网络搜索工具
tavily_search_tool = TavilySearch(max_result=5, tavily_api_key=appConfig.tavily_api_key)


@tool
def current_time() -> str:
    """获取当前系统时间

    Returns:
        str: 当前时间信息
    """
    now = datetime.now().astimezone()
    return now.strftime("%Y-%m-%d %H:%M:%S")


def tavily_called_info(event) -> ToolCalledInfo:
    event_name = event["event"]
    if event_name == "on_tool_start":
        return ToolCalledInfo(
            tool_name="tavily_search",
            tool_called_param=event["data"]["input"]["query"],
            tool_result="",
        )
    else:
        output = json.loads(event["data"]["output"].content)
        title_list = [t["title"] for t in output["results"]]
        return ToolCalledInfo(
            tool_name="tavily_search",
            tool_called_param=output["query"],
            tool_result="\n".join(title_list),
        )


def current_time_called_info(event) -> ToolCalledInfo:
    event_name = event["event"]
    if event_name == "on_tool_start":
        return ToolCalledInfo(
            tool_name="current_time",
            tool_called_param="",
            tool_result="",
        )
    else:
        return ToolCalledInfo(
            tool_name="current_time",
            tool_called_param="",
            tool_result=event["data"]["output"].content,
        )


tool_called_info_parser = {
    "tavily_search": tavily_called_info,
    "current_time": current_time_called_info,
}


all_tool = [tavily_search_tool, current_time]
