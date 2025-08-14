"use client";

import { useState } from "react";
import { ChatInput } from "./ChatInput";

export function ChatInputDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);

    // Simulate processing delay
    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">ChatInput Demo</h2>

      <div className="border rounded-lg p-4 min-h-[200px] bg-muted/50">
        <h3 className="font-semibold mb-2">Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-muted-foreground">No messages yet...</p>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} className="p-2 bg-background rounded border">
                {message}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border rounded-lg">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isDisabled}
          placeholder={isDisabled ? "Processing..." : "Type your message..."}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Press Enter to send</p>
        <p>• Shift+Enter for new line (not implemented in this demo)</p>
        <p>• Button is disabled when input is empty or processing</p>
      </div>
    </div>
  );
}
