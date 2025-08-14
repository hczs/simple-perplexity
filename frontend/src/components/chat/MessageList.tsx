import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  className?: string;
  showLoadingSkeleton?: boolean;
}

export function MessageList({
  messages,
  isStreaming,
  className,
  showLoadingSkeleton = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isStreaming]);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent",
        className
      )}
    >
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-background animate-pulse" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                你好！我是 AI 助手
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                我可以帮你解答问题、处理文档、编写代码，或者只是聊天。
                <br />
                有什么我可以帮助你的吗？
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: "💡", text: "解答问题" },
                { icon: "📝", text: "写作协助" },
                { icon: "💻", text: "编程帮助" },
                { icon: "🔍", text: "信息搜索" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-foreground font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isStreamingThisMessage =
              isStreaming &&
              isLastMessage &&
              message.type === "assistant" &&
              message.status === "streaming";

            return (
              <MessageItem
                key={message.id}
                message={message}
                isStreaming={isStreamingThisMessage}
              />
            );
          })}

          {/* Show loading skeleton when processing */}
          {showLoadingSkeleton && (
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="enhanced-card rounded-2xl p-4 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    正在处理...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
