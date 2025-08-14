import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatContainer } from "../ChatContainer";

// Mock the useChat hook
const mockUseChat = {
  messages: [],
  currentToolCalls: [],
  isConnected: false,
  isStreaming: false,
  error: null,
  sendMessage: vi.fn(),
  resetChat: vi.fn(),
  clearError: vi.fn(),
};

vi.mock("@/hooks/useChat", () => ({
  useChat: () => mockUseChat,
}));

// Mock the theme toggle component
vi.mock("@/components/ui/theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

// Mock the child components
vi.mock("../MessageList", () => ({
  MessageList: ({ messages, toolCalls, isStreaming }: any) => (
    <div data-testid="message-list">
      <div data-testid="messages-count">{messages.length}</div>
      <div data-testid="tool-calls-count">{toolCalls.length}</div>
      <div data-testid="is-streaming">{isStreaming.toString()}</div>
    </div>
  ),
}));

vi.mock("../ChatInput", () => ({
  ChatInput: ({ onSendMessage, disabled, placeholder }: any) => (
    <div data-testid="chat-input">
      <input
        data-testid="input-field"
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === "test message") {
            onSendMessage("test message");
          }
        }}
      />
    </div>
  ),
}));

describe("ChatContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    Object.assign(mockUseChat, {
      messages: [],
      currentToolCalls: [],
      isConnected: false,
      isStreaming: false,
      error: null,
      sendMessage: vi.fn(),
      resetChat: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it("renders the chat container with all components", () => {
    render(<ChatContainer />);

    expect(screen.getByText("AI 助手")).toBeInTheDocument();
    expect(screen.getByTestId("message-list")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("shows connection status correctly", () => {
    render(<ChatContainer />);
    expect(screen.getByText("未连接")).toBeInTheDocument();

    // Test connected state
    Object.assign(mockUseChat, { isConnected: true });
    render(<ChatContainer />);
    expect(screen.getByText("已连接")).toBeInTheDocument();
  });

  it("shows streaming status when streaming", () => {
    Object.assign(mockUseChat, { isStreaming: true });
    render(<ChatContainer />);

    expect(screen.getByText("正在接收回复...")).toBeInTheDocument();
  });

  it("displays error message when there is an error", () => {
    Object.assign(mockUseChat, { error: "Connection failed" });
    render(<ChatContainer />);

    expect(screen.getByText("连接错误")).toBeInTheDocument();
    expect(screen.getByText("Connection failed")).toBeInTheDocument();
    expect(screen.getByText("重试")).toBeInTheDocument();
    expect(screen.getByText("忽略")).toBeInTheDocument();
  });

  it("handles retry button click", async () => {
    Object.assign(mockUseChat, { error: "Connection failed" });
    render(<ChatContainer />);

    const retryButton = screen.getByText("重试");
    fireEvent.click(retryButton);

    expect(mockUseChat.clearError).toHaveBeenCalledTimes(1);
  });

  it("handles ignore error button click", async () => {
    Object.assign(mockUseChat, { error: "Connection failed" });
    render(<ChatContainer />);

    const ignoreButton = screen.getByText("忽略");
    fireEvent.click(ignoreButton);

    expect(mockUseChat.clearError).toHaveBeenCalledTimes(1);
  });

  it("shows reset chat button when there are messages", () => {
    Object.assign(mockUseChat, {
      messages: [
        {
          id: "1",
          type: "user",
          content: "Hello",
          timestamp: Date.now(),
          status: "sent",
        },
      ],
    });
    render(<ChatContainer />);

    expect(screen.getByText("重置对话")).toBeInTheDocument();
  });

  it("handles reset chat button click", async () => {
    Object.assign(mockUseChat, {
      messages: [
        {
          id: "1",
          type: "user",
          content: "Hello",
          timestamp: Date.now(),
          status: "sent",
        },
      ],
    });
    render(<ChatContainer />);

    const resetButton = screen.getByText("重置对话");
    fireEvent.click(resetButton);

    expect(mockUseChat.resetChat).toHaveBeenCalledTimes(1);
  });

  it("disables input when streaming", () => {
    Object.assign(mockUseChat, { isStreaming: true });
    render(<ChatContainer />);

    const inputField = screen.getByTestId("input-field");
    expect(inputField).toBeDisabled();
    expect(inputField).toHaveAttribute("placeholder", "正在处理中，请稍候...");
  });

  it("disables input when there is an error", () => {
    Object.assign(mockUseChat, { error: "Connection failed" });
    render(<ChatContainer />);

    const inputField = screen.getByTestId("input-field");
    expect(inputField).toBeDisabled();
    expect(inputField).toHaveAttribute("placeholder", "请先解决连接错误...");
  });

  it("handles message sending", async () => {
    render(<ChatContainer />);

    const inputField = screen.getByTestId("input-field");
    fireEvent.change(inputField, { target: { value: "test message" } });

    await waitFor(() => {
      expect(mockUseChat.sendMessage).toHaveBeenCalledWith("test message");
    });
  });

  it("passes correct props to MessageList", () => {
    const messages = [
      {
        id: "1",
        type: "user" as const,
        content: "Hello",
        timestamp: Date.now(),
        status: "sent" as const,
      },
    ];
    const toolCalls = [
      {
        id: "1",
        name: "current_time" as const,
        param: "",
        result: "2023-01-01",
        timestamp: Date.now(),
        status: "complete" as const,
        displayName: "获取到当前时间为 2023-01-01",
      },
    ];

    Object.assign(mockUseChat, {
      messages,
      currentToolCalls: toolCalls,
      isStreaming: true,
    });

    render(<ChatContainer />);

    expect(screen.getByTestId("messages-count")).toHaveTextContent("1");
    expect(screen.getByTestId("tool-calls-count")).toHaveTextContent("1");
    expect(screen.getByTestId("is-streaming")).toHaveTextContent("true");
  });

  it("applies custom className", () => {
    const { container } = render(<ChatContainer className="custom-class" />);
    const chatContainer = container.firstChild as HTMLElement;
    expect(chatContainer).toHaveClass("custom-class");
  });

  it("disables reset button when streaming", () => {
    Object.assign(mockUseChat, {
      messages: [
        {
          id: "1",
          type: "user",
          content: "Hello",
          timestamp: Date.now(),
          status: "sent",
        },
      ],
      isStreaming: true,
    });
    render(<ChatContainer />);

    const resetButton = screen.getByText("重置对话");
    expect(resetButton).toBeDisabled();
  });
});
