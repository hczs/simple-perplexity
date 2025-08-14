import { ChatContainer } from "@/components/chat/ChatContainer";
import { FloatingThemeToggle } from "@/components/chat/FloatingThemeToggle";
import ErrorBoundary from "@/components/ui/error-boundary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "对话",
  description: "沉浸式 AI 对话体验",
};

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <div className="h-screen bg-background">
        <ChatContainer />
        <FloatingThemeToggle />
      </div>
    </ErrorBoundary>
  );
}
