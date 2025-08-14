import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageSkeleton } from "../MessageSkeleton";

describe("MessageSkeleton", () => {
  it("renders user message skeleton correctly", () => {
    const { container } = render(<MessageSkeleton isUser={true} />);

    const messageContainer = container.querySelector(".justify-end");
    expect(messageContainer).toBeInTheDocument();
  });

  it("renders assistant message skeleton correctly", () => {
    const { container } = render(<MessageSkeleton isUser={false} />);

    const messageContainer = container.querySelector(".justify-start");
    expect(messageContainer).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<MessageSkeleton className="custom-class" />);

    const messageContainer = container.querySelector(".custom-class");
    expect(messageContainer).toBeInTheDocument();
  });

  it("renders skeleton elements", () => {
    const { container } = render(<MessageSkeleton />);

    // Check for skeleton elements (they have animate-pulse class)
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders bounce animation elements", () => {
    const { container } = render(<MessageSkeleton />);

    // Check for bounce animation elements
    const bounceElements = container.querySelectorAll(".animate-bounce");
    expect(bounceElements.length).toBeGreaterThan(0);
  });
});
