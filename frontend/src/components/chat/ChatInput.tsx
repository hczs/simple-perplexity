"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { KeyboardEvent, useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  isStreaming?: boolean;
  isSending?: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled,
  placeholder = "输入您的消息...",
  isStreaming = false,
  isSending = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMessageEmpty = !message.trim();

  return (
    <div className="border-t bg-background">
      {/* Enhanced streaming indicator */}
      {isStreaming && (
        <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              AI 正在思考并回复中...
            </span>
            <div className="flex-1 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 p-4">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          autoFocus
        />
        <Button
          onClick={handleSend}
          disabled={disabled || isMessageEmpty || isSending}
          size="icon"
          className="shrink-0"
        >
          {isSending ? (
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
