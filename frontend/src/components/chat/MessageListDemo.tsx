import { Button } from "@/components/ui/button";
import { Message, ToolCall } from "@/types/chat";
import { useState } from "react";
import { MessageList } from "./MessageList";

export function MessageListDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const addUserMessage = () => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: "明天北京天气怎么样？",
      timestamp: Date.now(),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addToolCall = () => {
    const newToolCall: ToolCall = {
      id: `tool-${Date.now()}`,
      name: "current_time",
      param: "",
      result: "",
      timestamp: Date.now(),
      status: "calling",
      displayName: "正在获取当前时间",
    };
    setToolCalls((prev) => [...prev, newToolCall]);

    // Simulate completion after 2 seconds
    setTimeout(() => {
      setToolCalls((prev) =>
        prev.map((tc) =>
          tc.id === newToolCall.id
            ? {
                ...tc,
                status: "complete" as const,
                result: "2025-08-13 21:21:43",
              }
            : tc
        )
      );
    }, 2000);
  };

  const addAssistantMessage = () => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "streaming",
    };
    setMessages((prev) => [...prev, newMessage]);
    setIsStreaming(true);

    // Simulate streaming content
    const fullContent = "根据当前时间信息，我需要搜索明天的天气预报。";
    let currentContent = "";

    const interval = setInterval(() => {
      if (currentContent.length < fullContent.length) {
        currentContent += fullContent[currentContent.length];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, content: currentContent } : msg
          )
        );
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, status: "complete" as const }
              : msg
          )
        );
        setIsStreaming(false);
      }
    }, 100);
  };

  const clearAll = () => {
    setMessages([]);
    setToolCalls([]);
    setIsStreaming(false);
  };

  return (
    <div className="h-[600px] border rounded-lg flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold mb-3">MessageList Demo</h3>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={addUserMessage}>
            添加用户消息
          </Button>
          <Button size="sm" onClick={addToolCall} variant="outline">
            添加工具调用
          </Button>
          <Button size="sm" onClick={addAssistantMessage} variant="outline">
            添加流式回复
          </Button>
          <Button size="sm" onClick={clearAll} variant="destructive">
            清空
          </Button>
        </div>
      </div>

      <MessageList
        messages={messages}
        toolCalls={toolCalls}
        isStreaming={isStreaming}
        className="flex-1"
      />
    </div>
  );
}
