import { Message, ToolCall } from "@/types/chat";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MessageList } from "../MessageList";

// Mock the child components
vi.mock("../MessageItem", () => ({
  MessageItem: ({
    message,
    isStreaming,
  }: {
    message: Message;
    isStreaming?: boolean;
  }) => (
    <div data-testid={`message-${message.id}`} data-streaming={isStreaming}>
      {message.content}
    </div>
  ),
}));

vi.mock("../ToolCallDisplay", () => ({
  ToolCallDisplay: ({ toolCall }: { toolCall: ToolCall }) => (
    <div data-testid={`toolcall-${toolCall.id}`}>{toolCall.displayName}</div>
  ),
}));

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: mockScrollIntoView,
});

describe("MessageList", () => {
  const mockMessages: Message[] = [
    {
      id: "1",
      type: "user",
      content: "Hello",
      timestamp: 1000,
      status: "sent",
    },
    {
      id: "2",
      type: "assistant",
      content: "Hi there!",
      timestamp: 2000,
      status: "complete",
    },
  ];

  const mockToolCalls: ToolCall[] = [
    {
      id: "tool-1",
      name: "current_time",
      param: "",
      result: "2025-08-13 21:21:43",
      timestamp: 1500,
      status: "complete",
      displayName: "获取到当前时间为 2025-08-13 21:21:43",
    },
  ];

  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it("renders empty state when no messages or tool calls", () => {
    render(<MessageList messages={[]} toolCalls={[]} isStreaming={false} />);

    expect(screen.getByText("开始对话")).toBeInTheDocument();
    expect(screen.getByText(/发送消息开始与 AI 助手对话/)).toBeInTheDocument();
  });

  it("renders messages in chronological order", () => {
    render(
      <MessageList messages={mockMessages} toolCalls={[]} isStreaming={false} />
    );

    expect(screen.getByTestId("message-1")).toBeInTheDocument();
    expect(screen.getByTestId("message-2")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("renders tool calls in chronological order", () => {
    render(
      <MessageList
        messages={[]}
        toolCalls={mockToolCalls}
        isStreaming={false}
      />
    );

    expect(screen.getByTestId("toolcall-tool-1")).toBeInTheDocument();
    expect(
      screen.getByText("获取到当前时间为 2025-08-13 21:21:43")
    ).toBeInTheDocument();
  });

  it("renders messages and tool calls in correct chronological order", () => {
    const { container } = render(
      <MessageList
        messages={mockMessages}
        toolCalls={mockToolCalls}
        isStreaming={false}
      />
    );

    const items = container.querySelectorAll(
      '[data-testid^="message-"], [data-testid^="toolcall-"]'
    );

    // Should be in order: message-1 (1000), toolcall-tool-1 (1500), message-2 (2000)
    expect(items[0]).toHaveAttribute("data-testid", "message-1");
    expect(items[1]).toHaveAttribute("data-testid", "toolcall-tool-1");
    expect(items[2]).toHaveAttribute("data-testid", "message-2");
  });

  it("passes isStreaming prop to the last assistant message when streaming", () => {
    const streamingMessages: Message[] = [
      ...mockMessages,
      {
        id: "3",
        type: "assistant",
        content: "Streaming...",
        timestamp: 3000,
        status: "streaming",
      },
    ];

    render(
      <MessageList
        messages={streamingMessages}
        toolCalls={[]}
        isStreaming={true}
      />
    );

    // Only the last assistant message should have streaming=true
    expect(screen.getByTestId("message-1")).toHaveAttribute(
      "data-streaming",
      "false"
    );
    expect(screen.getByTestId("message-2")).toHaveAttribute(
      "data-streaming",
      "false"
    );
    expect(screen.getByTestId("message-3")).toHaveAttribute(
      "data-streaming",
      "true"
    );
  });

  it("does not pass isStreaming to user messages", () => {
    const streamingMessages: Message[] = [
      ...mockMessages,
      {
        id: "3",
        type: "user",
        content: "Another message",
        timestamp: 3000,
        status: "sent",
      },
    ];

    render(
      <MessageList
        messages={streamingMessages}
        toolCalls={[]}
        isStreaming={true}
      />
    );

    // User message should not be streaming even if isStreaming is true
    expect(screen.getByTestId("message-3")).toHaveAttribute(
      "data-streaming",
      "false"
    );
  });

  it("calls scrollIntoView when messages change", () => {
    const { rerender } = render(
      <MessageList
        messages={[mockMessages[0]]}
        toolCalls={[]}
        isStreaming={false}
      />
    );

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "end",
    });

    // Add another message
    rerender(
      <MessageList messages={mockMessages} toolCalls={[]} isStreaming={false} />
    );

    expect(mockScrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("calls scrollIntoView when tool calls change", () => {
    const { rerender } = render(
      <MessageList messages={[]} toolCalls={[]} isStreaming={false} />
    );

    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);

    // Add a tool call
    rerender(
      <MessageList
        messages={[]}
        toolCalls={mockToolCalls}
        isStreaming={false}
      />
    );

    expect(mockScrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("calls scrollIntoView when streaming status changes", () => {
    const { rerender } = render(
      <MessageList messages={mockMessages} toolCalls={[]} isStreaming={false} />
    );

    const initialCallCount = mockScrollIntoView.mock.calls.length;

    // Change streaming status
    rerender(
      <MessageList messages={mockMessages} toolCalls={[]} isStreaming={true} />
    );

    // Should have been called at least once more
    expect(mockScrollIntoView.mock.calls.length).toBeGreaterThan(
      initialCallCount
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <MessageList
        messages={[]}
        toolCalls={[]}
        isStreaming={false}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
