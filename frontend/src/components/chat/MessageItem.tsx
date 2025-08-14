import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { useEffect, useState } from "react";

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
  const [displayedContent, setDisplayedContent] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  // Typewriter effect for streaming assistant messages
  useEffect(() => {
    if (isAssistant && message.status === "streaming" && message.content) {
      setShowCursor(true);
      let currentIndex = displayedContent.length;

      if (currentIndex < message.content.length) {
        const timer = setTimeout(() => {
          setDisplayedContent(message.content.slice(0, currentIndex + 1));
        }, 30); // Typewriter speed: 30ms per character

        return () => clearTimeout(timer);
      }
    } else if (isAssistant && message.status === "complete") {
      // Show full content immediately when complete
      setDisplayedContent(message.content);
      setShowCursor(false);
    } else if (isUser) {
      // User messages show immediately
      setDisplayedContent(message.content);
      setShowCursor(false);
    }
  }, [
    message.content,
    message.status,
    isAssistant,
    isUser,
    displayedContent.length,
  ]);

  // Reset displayed content when message changes
  useEffect(() => {
    if (isUser || message.status !== "streaming") {
      setDisplayedContent(message.content);
    }
  }, [message.id, isUser, message.status, message.content]);

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] min-w-[200px]",
          isUser ? "ml-auto" : "mr-auto"
        )}
      >
        <Card
          className={cn(
            "transition-all duration-200",
            isUser
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/50 border-border",
            message.status === "error" && "border-destructive bg-destructive/10"
          )}
        >
          <CardContent className="p-4">
            {/* Message content */}
            <div className="space-y-2">
              {displayedContent || (isUser && message.content) ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {isUser ? message.content : displayedContent}
                  {showCursor && isAssistant && (
                    <span className="inline-block w-0.5 h-4 ml-1 bg-current animate-pulse" />
                  )}
                </p>
              ) : (
                isAssistant && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )
              )}
            </div>

            {/* Message metadata */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
              <span className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                {message.status === "sending" && (
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-xs opacity-60">发送中</span>
                  </div>
                )}
                {message.status === "streaming" && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs opacity-60 text-blue-600 dark:text-blue-400">
                      正在输入
                    </span>
                  </div>
                )}
                {message.status === "complete" && isAssistant && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs opacity-60 text-green-600 dark:text-green-400">
                      完成
                    </span>
                  </div>
                )}
                {message.status === "error" && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-destructive">!</span>
                    <span className="text-xs text-destructive">发送失败</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
