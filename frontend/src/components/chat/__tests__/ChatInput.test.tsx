import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatInput } from "../ChatInput";

// Mock the utils
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

describe("ChatInput", () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it("renders input field and send button", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    expect(screen.getByPlaceholderText("输入您的消息...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        disabled={false}
        placeholder="自定义占位符"
      />
    );

    expect(screen.getByPlaceholderText("自定义占位符")).toBeInTheDocument();
  });

  it("updates input value when typing", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    fireEvent.change(input, { target: { value: "测试消息" } });

    expect(input).toHaveValue("测试消息");
  });

  it("calls onSendMessage when send button is clicked", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "测试消息" } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith("测试消息");
  });

  it("clears input after sending message", async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "测试消息" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("sends message when Enter key is pressed", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    fireEvent.change(input, { target: { value: "测试消息" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockOnSendMessage).toHaveBeenCalledWith("测试消息");
  });

  it("does not send message when Shift+Enter is pressed", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    fireEvent.change(input, { target: { value: "测试消息" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("disables input and button when disabled prop is true", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    const sendButton = screen.getByRole("button");

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("disables send button when input is empty", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const sendButton = screen.getByRole("button");
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when input has content", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "测试" } });
    expect(sendButton).not.toBeDisabled();
  });

  it("does not send empty or whitespace-only messages", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    const sendButton = screen.getByRole("button");

    // Test empty message
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();

    // Test whitespace-only message
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("trims whitespace from messages before sending", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);

    const input = screen.getByPlaceholderText("输入您的消息...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "  测试消息  " } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith("测试消息");
  });
});
