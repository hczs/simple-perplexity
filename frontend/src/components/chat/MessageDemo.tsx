import { Message } from "@/types/chat";
import { MessageItem } from "./MessageItem";

export function MessageDemo() {
  const userMessage: Message = {
    id: "1",
    type: "user",
    content: "明天北京天气怎么样？",
    timestamp: Date.now() - 60000,
    status: "sent",
  };

  const assistantMessage: Message = {
    id: "2",
    type: "assistant",
    content:
      "根据最新的天气预报，明天北京天气晴朗，温度在15-25度之间，风力3级，是个不错的天气。建议您可以安排一些户外活动。",
    timestamp: Date.now(),
    status: "complete",
    toolCalls: [
      {
        id: "tool-1",
        name: "current_time",
        param: "",
        result: "2025-08-13 21:21:43",
        status: "complete",
      },
      {
        id: "tool-2",
        name: "tavily_search",
        param: "北京明天2025年8月14日天气预报",
        result: "北京明天天气晴朗\n温度15-25度\n风力3级\n空气质量良好",
        status: "complete",
      },
    ],
  };

  const streamingMessage: Message = {
    id: "3",
    type: "assistant",
    content: "正在为您查询天气信息",
    timestamp: Date.now(),
    status: "streaming",
    toolCalls: [
      {
        id: "tool-3",
        name: "tavily_search",
        param: "上海天气预报",
        status: "calling",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">消息组件演示</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">用户消息</h3>
        <MessageItem message={userMessage} />

        <h3 className="text-lg font-semibold">助手消息</h3>
        <MessageItem message={assistantMessage} />

        <h3 className="text-lg font-semibold">流式消息（带工具调用）</h3>
        <MessageItem message={streamingMessage} isStreaming={true} />
      </div>
    </div>
  );
}
