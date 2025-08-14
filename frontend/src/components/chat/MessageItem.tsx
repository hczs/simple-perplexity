"use client";

import { cn } from "@/lib/utils";
import { Message, ToolCall } from "@/types/chat";
import { Bot, Clock, Search, User } from "lucide-react";
import { MessageContent } from "./MessageContent";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageItem({
  message,
  isStreaming = false,
}: MessageItemProps) {
  const isUser = message.type === "user";
  const isAssistant = message.type === "assistant";

  // 工具调用渲染函数
  const renderToolCalls = (toolCalls: ToolCall[]) => {
    if (!toolCalls || toolCalls.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        {toolCalls.map((toolCall) => (
          <div
            key={toolCall.id}
            className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-lg text-sm border border-border/50"
          >
            {toolCall.name === "current_time" ? (
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              {toolCall.status === "calling" ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {toolCall.name === "current_time"
                      ? "获取时间中"
                      : `搜索 "${toolCall.param}"`}
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {toolCall.name === "current_time"
                      ? "已获取时间"
                      : "搜索完成"}
                  </span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex gap-4 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            isUser
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground border border-border"
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
      </div>

      {/* Message content */}
      <div className={cn("flex-1 max-w-3xl", isUser && "flex justify-end")}>
        <div
          className={cn(
            "group relative",
            isUser ? "max-w-[85%]" : "max-w-full"
          )}
        >
          {/* Message bubble */}
          <div
            className={cn(
              "px-4 py-3 transition-all duration-200",
              isUser
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md user-message-bubble shadow-sm"
                : "enhanced-card text-card-foreground rounded-2xl rounded-bl-md",
              message.status === "error" &&
                "bg-destructive/10 border-destructive/20 text-destructive"
            )}
          >
            {/* Content */}
            {message.status === "sending" && isUser ? (
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100 opacity-60" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200 opacity-60" />
                </div>
                <span className="text-sm opacity-80">发送中...</span>
              </div>
            ) : message.content ? (
              <>
                <MessageContent
                  content={message.content}
                  isUser={isUser}
                  isStreaming={isStreaming && message.status === "streaming"}
                  status={message.status}
                />
                {/* 工具调用显示 */}
                {isAssistant &&
                  message.toolCalls &&
                  renderToolCalls(message.toolCalls)}
              </>
            ) : (
              isAssistant && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      正在思考...
                    </span>
                  </div>
                  {/* 工具调用显示 */}
                  {message.toolCalls && renderToolCalls(message.toolCalls)}
                </>
              )
            )}
          </div>

          {/* Timestamp and status */}
          <div
            className={cn(
              "flex items-center gap-2 mt-2 px-1 text-xs text-muted-foreground",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isUser && "justify-end"
            )}
          >
            <span>
              {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* Status indicators */}
            {message.status === "streaming" && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-medium">正在输入</span>
              </div>
            )}
            {message.status === "complete" && isAssistant && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  已完成
                </span>
              </div>
            )}
            {message.status === "error" && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                <span className="text-destructive font-medium">发送失败</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
