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
}

export function ChatInput({
  onSendMessage,
  disabled,
  placeholder = "输入您的消息...",
  isStreaming = false,
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
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100" />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200" />
            </div>
            <span className="text-blue-600 dark:text-blue-400">
              AI 正在思考并回复中...
            </span>
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
          disabled={disabled || isMessageEmpty}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
