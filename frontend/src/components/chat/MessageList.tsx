import { cn } from "@/lib/utils";
import { Message, ToolCall } from "@/types/chat";
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { ToolCallDisplay } from "./ToolCallDisplay";

interface MessageListProps {
  messages: Message[];
  toolCalls: ToolCall[];
  isStreaming: boolean;
  className?: string;
  showLoadingSkeleton?: boolean;
}

export function MessageList({
  messages,
  toolCalls,
  isStreaming,
  className,
  showLoadingSkeleton = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages or tool calls are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Scroll to bottom when messages, tool calls, or streaming status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, toolCalls.length, isStreaming]);

  // Also scroll when message content updates (for streaming)
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [messages, isStreaming]);

  // Create a combined timeline of messages and tool calls
  const createTimeline = () => {
    const timeline: Array<
      | { type: "message"; data: Message; timestamp: number }
      | { type: "toolCall"; data: ToolCall; timestamp: number }
    > = [];

    // Add messages to timeline
    messages.forEach((message) => {
      timeline.push({
        type: "message",
        data: message,
        timestamp: message.timestamp,
      });
    });

    // Add tool calls to timeline
    toolCalls.forEach((toolCall) => {
      timeline.push({
        type: "toolCall",
        data: toolCall,
        timestamp: toolCall.timestamp,
      });
    });

    // Sort by timestamp
    return timeline.sort((a, b) => a.timestamp - b.timestamp);
  };

  const timeline = createTimeline();

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto px-4 py-6 space-y-4",
        "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        className
      )}
    >
      {/* Empty state */}
      {timeline.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="text-4xl">💬</div>
            <h3 className="text-lg font-medium text-muted-foreground">
              开始对话
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              发送消息开始与 AI 助手对话，支持实时搜索和时间查询功能
            </p>
          </div>
        </div>
      )}

      {/* Render timeline items */}
      {timeline.map((item, index) => {
        if (item.type === "message") {
          const message = item.data as Message;
          const isLastMessage = index === timeline.length - 1;
          const isStreamingThisMessage =
            isStreaming &&
            isLastMessage &&
            message.type === "assistant" &&
            message.status === "streaming";

          return (
            <MessageItem
              key={`message-${message.id}`}
              message={message}
              isStreaming={isStreamingThisMessage}
            />
          );
        } else {
          const toolCall = item.data as ToolCall;
          return (
            <ToolCallDisplay
              key={`toolcall-${toolCall.id}`}
              toolCall={toolCall}
            />
          );
        }
      })}

      {/* Show loading skeleton when processing */}
      {showLoadingSkeleton && (
        <>
          <ToolCallSkeleton toolType="time" />
          <MessageSkeleton isUser={false} />
        </>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
