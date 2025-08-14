import { Message } from "@/types/chat";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MessageItem } from "../MessageItem";

// Mock the utils
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

describe("MessageItem", () => {
  const mockUserMessage: Message = {
    id: "1",
    type: "user",
    content: "Hello, how are you?",
    timestamp: Date.now(),
    status: "sent",
  };

  const mockAssistantMessage: Message = {
    id: "2",
    type: "assistant",
    content: "I'm doing well, thank you!",
    timestamp: Date.now(),
    status: "complete",
  };

  it("renders user message correctly", () => {
    render(<MessageItem message={mockUserMessage} />);

    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
  });

  it("renders assistant message correctly", () => {
    render(<MessageItem message={mockAssistantMessage} />);

    expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();
  });

  it("shows streaming indicator for assistant message", () => {
    render(<MessageItem message={mockAssistantMessage} isStreaming={true} />);

    expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();
  });

  it("shows skeleton for empty assistant message", () => {
    const emptyMessage: Message = {
      ...mockAssistantMessage,
      content: "",
    };

    render(<MessageItem message={emptyMessage} />);

    // Should show skeleton elements
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error state correctly", () => {
    const errorMessage: Message = {
      ...mockUserMessage,
      status: "error",
    };

    render(<MessageItem message={errorMessage} />);

    expect(screen.getByText("发送失败")).toBeInTheDocument();
  });

  it("shows streaming status for assistant message", () => {
    const streamingMessage: Message = {
      ...mockAssistantMessage,
      status: "streaming",
      content: "I'm typing...",
    };

    render(<MessageItem message={streamingMessage} />);

    expect(screen.getByText("正在输入")).toBeInTheDocument();
  });

  it("shows complete status for assistant message", () => {
    const completeMessage: Message = {
      ...mockAssistantMessage,
      status: "complete",
    };

    render(<MessageItem message={completeMessage} />);

    expect(screen.getByText("完成")).toBeInTheDocument();
  });

  it("shows sending status for user message", () => {
    const sendingMessage: Message = {
      ...mockUserMessage,
      status: "sending",
    };

    render(<MessageItem message={sendingMessage} />);

    expect(screen.getByText("发送中")).toBeInTheDocument();
  });

  it("displays typewriter effect for streaming assistant messages", async () => {
    const streamingMessage: Message = {
      ...mockAssistantMessage,
      status: "streaming",
      content: "Hello world",
    };

    render(<MessageItem message={streamingMessage} />);

    // Initially should show empty or partial content
    await waitFor(() => {
      const content = screen.getByText(/Hello/);
      expect(content).toBeInTheDocument();
    });
  });
});
