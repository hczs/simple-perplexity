"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message } from "@/types/chat";
import { useState } from "react";
import { MessageItem } from "./MessageItem";

export function StreamingDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const simulateStreaming = () => {
    if (isStreaming) return;

    setIsStreaming(true);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: "请告诉我关于人工智能的信息",
      timestamp: Date.now(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add streaming assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      type: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "streaming",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simulate streaming content
    const fullContent =
      "人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。这包括学习、推理、问题解决、感知和语言理解等能力。现代AI系统使用机器学习算法，特别是深度学习，来分析大量数据并做出预测或决策。";

    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < fullContent.length) {
        const nextChar = fullContent[currentIndex];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent.slice(0, currentIndex + 1) }
              : msg
          )
        );
        currentIndex++;
      } else {
        // Complete the message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, status: "complete" as const }
              : msg
          )
        );
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, 50); // 50ms per character for demo
  };

  const clearMessages = () => {
    setMessages([]);
    setIsStreaming(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={simulateStreaming} disabled={isStreaming}>
          {isStreaming ? "正在流式输出..." : "开始流式演示"}
        </Button>
        <Button
          variant="outline"
          onClick={clearMessages}
          disabled={isStreaming}
        >
          清空消息
        </Button>
      </div>

      <Card className="max-h-96 overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-sm">流式输出演示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              点击"开始流式演示"按钮查看打字机效果
            </p>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isStreaming={message.status === "streaming"}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
