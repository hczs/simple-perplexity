import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";

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
              {message.content ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                  {isStreaming && isAssistant && (
                    <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
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
              <div className="flex items-center space-x-1">
                {message.status === "sending" && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                )}
                {message.status === "streaming" && (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                )}
                {message.status === "error" && (
                  <span className="text-xs text-destructive">!</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
