"use client";

import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function FloatingThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleThemeToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === "dark" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    );
  };

  const getTitle = () => {
    if (theme === "light") return "切换到深色模式";
    if (theme === "dark") return "切换到跟随系统";
    return "切换到浅色模式";
  };

  return (
    <Button
      size="icon"
      variant="secondary"
      onClick={handleThemeToggle}
      className="fixed bottom-6 left-6 z-20 h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-background/80 border border-border/50 hover:scale-105 hover:shadow-xl transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
      title={getTitle()}
    >
      <div className="transition-transform duration-300 hover:rotate-12">
        {getIcon()}
      </div>
    </Button>
  );
}
