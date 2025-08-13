def use_tool(msg) -> bool:
    """判断 AI 是否需要使用工具

    Args:
        msg (AIMessage): AI 的消息

    Returns:
        bool: 需要使用工具返回 True，反之返回 False
    """
    if hasattr(msg, "tool_calls") and len(msg.tool_calls) > 0:
        return True
    return False
