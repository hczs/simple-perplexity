import { useTheme, useThemeTransition } from "@/hooks/useTheme";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../theme-toggle";

// Mock the hooks
vi.mock("@/hooks/useTheme", () => ({
  useTheme: vi.fn(),
  useThemeTransition: vi.fn(),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Sun: ({ className, ...props }: any) => (
    <div data-testid="sun-icon" className={className} {...props} />
  ),
  Moon: ({ className, ...props }: any) => (
    <div data-testid="moon-icon" className={className} {...props} />
  ),
  Monitor: ({ className, ...props }: any) => (
    <div data-testid="monitor-icon" className={className} {...props} />
  ),
}));

const mockUseTheme = useTheme as any;
const mockUseThemeTransition = useThemeTransition as any;

describe("ThemeToggle", () => {
  const mockToggleTheme = vi.fn();
  const mockStartTransition = vi.fn();
  const mockGetThemeDisplayName = vi.fn();

  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      toggleTheme: mockToggleTheme,
      getThemeDisplayName: mockGetThemeDisplayName,
    });

    mockUseThemeTransition.mockReturnValue({
      isTransitioning: false,
      startTransition: mockStartTransition,
    });

    mockGetThemeDisplayName.mockImplementation((theme) => {
      const names = {
        light: "浅色",
        dark: "深色",
        system: "跟随系统",
      };
      return names[theme as keyof typeof names] || "浅色";
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders theme toggle button", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("displays correct icon for light theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("monitor-icon")).not.toBeInTheDocument();
    });

    it("displays correct icon for dark theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        resolvedTheme: "dark",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("monitor-icon")).not.toBeInTheDocument();
    });

    it("displays correct icon for system theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "system",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      expect(screen.getByTestId("monitor-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
    });

    it("shows label when showLabel is true", () => {
      mockGetThemeDisplayName.mockReturnValue("浅色");

      render(<ThemeToggle showLabel />);

      expect(screen.getByText("浅色")).toBeInTheDocument();
    });

    it("hides label when showLabel is false", () => {
      mockGetThemeDisplayName.mockReturnValue("浅色");

      render(<ThemeToggle showLabel={false} />);

      expect(screen.queryByText("浅色")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "切换到深色模式");
    });

    it("has proper title attribute", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });
      mockGetThemeDisplayName.mockReturnValue("浅色");

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "title",
        "当前主题: 浅色 (切换到深色模式)"
      );
    });

    it("has screen reader text", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });
      mockGetThemeDisplayName.mockReturnValue("浅色");

      render(<ThemeToggle />);

      expect(
        screen.getByText("当前主题: 浅色，点击切换到深色模式")
      ).toBeInTheDocument();
    });
  });

  describe("Theme Toggle Functionality", () => {
    it("calls toggleTheme when clicked", async () => {
      const user = userEvent.setup();

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it("starts transition animation when clicked", async () => {
      const user = userEvent.setup();

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockStartTransition).toHaveBeenCalledTimes(1);
    });

    it("handles keyboard interaction", async () => {
      const user = userEvent.setup();

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
      expect(mockStartTransition).toHaveBeenCalledTimes(1);
    });
  });

  describe("Animation States", () => {
    it("applies transition styles when transitioning", () => {
      mockUseThemeTransition.mockReturnValue({
        isTransitioning: true,
        startTransition: mockStartTransition,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("scale-95");
    });

    it("shows animation overlay when transitioning", () => {
      mockUseThemeTransition.mockReturnValue({
        isTransitioning: true,
        startTransition: mockStartTransition,
      });

      render(<ThemeToggle />);

      const overlay = screen
        .getByRole("button")
        .querySelector(".animate-pulse");
      expect(overlay).toBeInTheDocument();
    });

    it("applies icon animation when transitioning", () => {
      mockUseThemeTransition.mockReturnValue({
        isTransitioning: true,
        startTransition: mockStartTransition,
      });

      render(<ThemeToggle />);

      const icon = screen.getByTestId("sun-icon");
      expect(icon).toHaveClass("rotate-180", "scale-110");
    });
  });

  describe("Theme Hints", () => {
    it("shows correct hint for light theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "切换到深色模式");
    });

    it("shows correct hint for dark theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        resolvedTheme: "dark",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "切换到跟随系统");
    });

    it("shows correct hint for system theme", () => {
      mockUseTheme.mockReturnValue({
        theme: "system",
        resolvedTheme: "light",
        toggleTheme: mockToggleTheme,
        getThemeDisplayName: mockGetThemeDisplayName,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "切换到浅色模式");
    });
  });

  describe("Props", () => {
    it("applies custom className", () => {
      render(<ThemeToggle className="custom-class" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("applies different variants", () => {
      const { rerender } = render(<ThemeToggle variant="ghost" />);

      let button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");

      rerender(<ThemeToggle variant="default" />);
      button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary");
    });

    it("applies different sizes", () => {
      const { rerender } = render(<ThemeToggle size="sm" />);

      let button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");

      rerender(<ThemeToggle size="lg" />);
      button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
    });
  });
});
