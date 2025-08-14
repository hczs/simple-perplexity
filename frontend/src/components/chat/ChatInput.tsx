"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, Mic, Paperclip } from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";

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
  placeholder = "有什么我可以帮助你的吗？",
  isStreaming = false,
  isSending = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const isMessageEmpty = !message.trim();

  return (
    <div className="relative">
      {/* Input container */}
      <div className="p-4 pb-6">
        <div
          className={cn(
            "relative flex items-end gap-3 p-4 rounded-3xl transition-all duration-200",
            "bg-background/80 backdrop-blur-sm",
            "border-2 border-border/50",
            isFocused && "border-ring bg-background",
            disabled && "opacity-50 cursor-not-allowed",
            "shadow-lg shadow-black/5 dark:shadow-black/20"
          )}
        >
          {/* Attachment button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full resize-none border-0 bg-transparent",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-0",
                "text-base leading-6",
                "max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30"
              )}
              style={{ minHeight: "24px" }}
            />
          </div>

          {/* Voice input button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={disabled || isMessageEmpty}
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-200",
              isMessageEmpty
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 hover:bg-primary/90"
            )}
          >
            {isSending ? (
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
              </div>
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-center mt-3 gap-2">
          <div className="flex gap-1">
            {["解释代码", "写邮件", "翻译", "总结"].map((action) => (
              <Button
                key={action}
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                onClick={() => setMessage(action + ": ")}
                disabled={disabled}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
