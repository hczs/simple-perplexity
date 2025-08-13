from enum import Enum


class NodeNames(str, Enum):
    # 协调者节点
    SUPERVISOR = "supervisor"
    # 问题拆解细化，优化用户的提问 prompt
    QUESTION_ANALYSIS = "question_analysis"
    # 专注于信息收集，不对问题进行分析或实施
    RESEARCHER = "researcher"
    # 工具节点,RESEARCHER 调用的工具
    TOOL_NODE = "tool_node"
    #
    TOOL_ROUTER = "tool_router"
    # 回答节点（基于历史对话信息，对问题进行回答）
    ANSWER = "answer"
