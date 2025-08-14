"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Settings, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const {
    messages,
    isConnected,
    isStreaming,
    isSending,
    error,
    sendMessage,
    resetChat,
    clearError,
  } = useChat();

  const [showSettings, setShowSettings] = useState(false);

  const handleSendMessage = useCallback(
    async (message: string) => {
      try {
        await sendMessage(message);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [sendMessage]
  );

  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleResetChat = useCallback(() => {
    resetChat();
  }, [resetChat]);

  const isInputDisabled = isStreaming || isSending || Boolean(error);

  // Floating action button for settings
  const FloatingActions = () => (
    <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
      {messages.length > 0 && (
        <Button
          size="icon"
          variant="secondary"
          onClick={handleResetChat}
          disabled={isStreaming || isSending}
          className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-background/80 border border-border/50 hover:scale-105 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
          title="重新开始对话"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      <Button
        size="icon"
        variant="secondary"
        onClick={() => setShowSettings(!showSettings)}
        className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-background/80 border border-border/50 hover:scale-105 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
        title="设置"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );

  // Connection indicator (minimal)
  const ConnectionIndicator = () => (
    <div className="absolute top-6 left-6 z-10">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          "backdrop-blur-sm transition-all duration-200",
          isConnected
            ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
        )}
      >
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-emerald-500" : "bg-red-500",
            isConnected && "animate-pulse"
          )}
        />
        {isConnected ? "在线" : "离线"}
      </div>
    </div>
  );

  // Error overlay
  const ErrorOverlay = () => {
    if (!error) return null;

    return (
      <div className="absolute inset-0 z-20 bg-background/20 backdrop-blur-sm flex items-center justify-center">
        <div className="enhanced-card rounded-2xl p-6 mx-4 max-w-md shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-foreground">连接中断</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRetry} className="flex-1">
                  重新连接
                </Button>
                <Button size="sm" variant="ghost" onClick={clearError}>
                  忽略
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI thinking indicator
  const AIThinkingIndicator = () => {
    if (!isStreaming && !isSending) return null;

    return (
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm shadow-lg border border-border">
          <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {isSending ? "发送中..." : "AI 正在思考..."}
          </span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100" />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative h-screen flex flex-col", className)}>
      {/* Floating elements */}
      <ConnectionIndicator />
      <FloatingActions />
      <AIThinkingIndicator />
      <ErrorOverlay />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Message area */}
        <div className="flex-1 relative">
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            showLoadingSkeleton={isSending && !isStreaming}
            className="h-full"
          />
        </div>

        {/* Input area */}
        <div className="relative">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isInputDisabled}
            isStreaming={isStreaming}
            isSending={isSending}
            placeholder={
              error
                ? "连接中断，请重新连接..."
                : isSending
                ? "发送中..."
                : isStreaming
                ? "AI 正在回复..."
                : "有什么我可以帮助你的吗？"
            }
          />
        </div>
      </div>
    </div>
  );
}
