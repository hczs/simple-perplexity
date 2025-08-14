import { ToolCall } from "@/types/chat";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCallDisplay } from "../ToolCallDisplay";

// Mock the utils
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

describe("ToolCallDisplay", () => {
  const mockTimeToolCall: ToolCall = {
    id: "1",
    name: "current_time",
    param: "",
    result: "",
    timestamp: Date.now(),
    status: "calling",
    displayName: "正在获取当前时间",
  };

  const mockSearchToolCall: ToolCall = {
    id: "2",
    name: "tavily_search",
    param: "北京天气",
    result: "",
    timestamp: Date.now(),
    status: "calling",
    displayName: "正在搜索",
  };

  it("renders time tool call in calling state", () => {
    render(<ToolCallDisplay toolCall={mockTimeToolCall} />);

    expect(screen.getByText("正在获取当前时间")).toBeInTheDocument();
    expect(screen.getByText("🕐")).toBeInTheDocument();
  });

  it("renders search tool call in calling state", () => {
    render(<ToolCallDisplay toolCall={mockSearchToolCall} />);

    expect(screen.getByText("正在搜索 北京天气")).toBeInTheDocument();
    expect(screen.getByText("🔍")).toBeInTheDocument();
    expect(screen.getByText("搜索关键词: 北京天气")).toBeInTheDocument();
  });

  it("renders time tool call in complete state", () => {
    const completeTimeCall: ToolCall = {
      ...mockTimeToolCall,
      status: "complete",
      result: "2025-08-13 21:21:43",
    };

    render(<ToolCallDisplay toolCall={completeTimeCall} />);

    expect(
      screen.getByText("获取到当前时间为 2025-08-13 21:21:43")
    ).toBeInTheDocument();
    expect(screen.getByText("时间: 2025-08-13 21:21:43")).toBeInTheDocument();
  });

  it("renders search tool call in complete state", () => {
    const completeSearchCall: ToolCall = {
      ...mockSearchToolCall,
      status: "complete",
      result: "北京明天天气晴朗\n温度15-25度\n风力3级",
    };

    render(<ToolCallDisplay toolCall={completeSearchCall} />);

    expect(
      screen.getByText("搜索到 3 个结果，正在生成回答")
    ).toBeInTheDocument();
  });

  it("shows loading animation for calling status", () => {
    render(<ToolCallDisplay toolCall={mockTimeToolCall} />);

    // Should show loading dots
    const loadingDots = document.querySelectorAll(".animate-bounce");
    expect(loadingDots.length).toBe(3);
  });

  it("shows complete status indicator", () => {
    const completeCall: ToolCall = {
      ...mockTimeToolCall,
      status: "complete",
      result: "2025-08-13 21:21:43",
    };

    render(<ToolCallDisplay toolCall={completeCall} />);

    // Should show green status dot
    const statusDot = document.querySelector(".bg-green-500");
    expect(statusDot).toBeInTheDocument();
  });
});
