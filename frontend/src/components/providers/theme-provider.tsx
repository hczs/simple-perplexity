"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

/**
 * 内部主题同步组件 - 确保Tailwind v4暗色主题正确生效
 */
function ThemeSyncInternal() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const html = document.documentElement;
    const body = document.body;

    // 清除所有可能的主题类
    html.classList.remove("light", "dark");
    html.removeAttribute("data-theme");
    body.classList.remove("light", "dark");

    // 根据解析后的主题设置多重属性，确保兼容性
    if (resolvedTheme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
      body.classList.add("dark");
    } else {
      html.classList.add("light");
      html.setAttribute("data-theme", "light");
      body.classList.add("light");
    }

    // 触发样式重新计算（更温和的方式）
    requestAnimationFrame(() => {
      html.style.colorScheme = resolvedTheme;
    });
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey="theme"
      themes={["light", "dark", "system"]}
      {...props}
    >
      <ThemeSyncInternal />
      {children}
    </NextThemesProvider>
  );
}
