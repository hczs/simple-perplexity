"use client";

import { Button } from "@/components/ui/button";
import { useTheme, useThemeTransition } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback } from "react";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  variant = "outline",
  size = "icon",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme, getThemeDisplayName } = useTheme();
  const { isTransitioning, startTransition } = useThemeTransition();

  const handleToggle = useCallback(() => {
    startTransition();
    toggleTheme();
  }, [toggleTheme, startTransition]);

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return (
          <Sun
            className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-200 ease-in-out",
              isTransitioning && "rotate-180 scale-110"
            )}
          />
        );
      case "dark":
        return (
          <Moon
            className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-200 ease-in-out",
              isTransitioning && "rotate-180 scale-110"
            )}
          />
        );
      case "system":
        return (
          <Monitor
            className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-200 ease-in-out",
              isTransitioning && "scale-110"
            )}
          />
        );
      default:
        return (
          <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-200 ease-in-out" />
        );
    }
  };

  const getNextThemeHint = () => {
    switch (theme) {
      case "light":
        return "切换到深色模式";
      case "dark":
        return "切换到跟随系统";
      case "system":
        return "切换到浅色模式";
      default:
        return "切换主题";
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "relative overflow-hidden transition-all duration-200 ease-in-out",
        isTransitioning && "scale-95",
        className
      )}
      aria-label={getNextThemeHint()}
      title={`当前主题: ${getThemeDisplayName()} (${getNextThemeHint()})`}
    >
      <div
        className={cn(
          "flex items-center gap-2 transition-all duration-200 ease-in-out",
          isTransitioning && "opacity-80"
        )}
      >
        {getThemeIcon()}
        {showLabel && (
          <span className="text-sm font-medium">{getThemeDisplayName()}</span>
        )}
      </div>

      {/* 切换动画效果 */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}

      {/* 可访问性提示 */}
      <span className="sr-only">
        当前主题: {getThemeDisplayName()}，点击{getNextThemeHint()}
      </span>
    </Button>
  );
}
