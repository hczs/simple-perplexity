import { ChatContainer } from "@/components/chat/ChatContainer";
import ErrorBoundary from "@/components/ui/error-boundary";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "聊天界面 - Chat Interface",
  description: "现代化的对话界面，支持实时流式回复和工具调用",
};

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        {/* 页面头部 */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">聊天界面</h1>
              <p className="text-sm text-muted-foreground">
                支持实时流式回复和智能工具调用
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* 聊天主体区域 */}
        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto h-full p-4">
            <ChatContainer />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
