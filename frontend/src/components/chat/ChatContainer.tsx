"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const {
    messages,
    currentToolCalls,
    isConnected,
    isStreaming,
    error,
    sendMessage,
    resetChat,
    clearError,
  } = useChat();

  // Handle message sending with error handling
  const handleSendMessage = useCallback(
    async (message: string) => {
      try {
        await sendMessage(message);
      } catch (error) {
        console.error("Failed to send message:", error);
        // Error is already handled by useChat hook
      }
    },
    [sendMessage]
  );

  // Handle retry action
  const handleRetry = useCallback(() => {
    clearError();
    // Optionally, you could resend the last user message here
    // For now, just clear the error and let user send again
  }, [clearError]);

  // Handle reset chat
  const handleResetChat = useCallback(() => {
    resetChat();
  }, [resetChat]);

  // Determine if input should be disabled
  const isInputDisabled = isStreaming || Boolean(error);

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span>已连接</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-gray-500" />
          <span>未连接</span>
        </>
      )}
      {isStreaming && (
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          <span>正在接收...</span>
        </div>
      )}
    </div>
  );

  // Error display component
  const ErrorDisplay = () => {
    if (!error) return null;

    return (
      <Card className="mx-4 mb-4 p-4 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-destructive">连接错误</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                重试
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearError}
                className="h-8"
              >
                忽略
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Header component
  const ChatHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI 助手</h1>
            <ConnectionStatus />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetChat}
            disabled={isStreaming}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            重置对话
          </Button>
        )}
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <Card
      className={cn(
        "flex flex-col h-full max-h-screen overflow-hidden",
        "border-0 rounded-none md:border md:rounded-lg",
        "md:max-h-[800px] md:h-[800px]",
        className
      )}
    >
      {/* Header */}
      <ChatHeader />

      {/* Error Display */}
      <ErrorDisplay />

      {/* Message List */}
      <MessageList
        messages={messages}
        toolCalls={currentToolCalls}
        isStreaming={isStreaming}
        className="flex-1 min-h-0"
      />

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isInputDisabled}
        placeholder={
          error
            ? "请先解决连接错误..."
            : isStreaming
            ? "正在处理中，请稍候..."
            : "输入您的消息..."
        }
      />
    </Card>
  );
}
