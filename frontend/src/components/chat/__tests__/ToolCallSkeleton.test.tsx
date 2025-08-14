import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolCallSkeleton } from "../ToolCallSkeleton";

describe("ToolCallSkeleton", () => {
  it("renders with default generic tool type", () => {
    render(<ToolCallSkeleton />);

    expect(screen.getByText("⚙️")).toBeInTheDocument();
  });

  it("renders with search tool type", () => {
    render(<ToolCallSkeleton toolType="search" />);

    expect(screen.getByText("🔍")).toBeInTheDocument();
  });

  it("renders with time tool type", () => {
    render(<ToolCallSkeleton toolType="time" />);

    expect(screen.getByText("🕐")).toBeInTheDocument();
  });

  it("renders skeleton elements", () => {
    const { container } = render(<ToolCallSkeleton />);

    // Check for skeleton elements (they have animate-pulse class)
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders loading animation", () => {
    const { container } = render(<ToolCallSkeleton />);

    // Check for bounce animation elements
    const bounceElements = container.querySelectorAll(".animate-bounce");
    expect(bounceElements.length).toBeGreaterThan(0);
  });
});
