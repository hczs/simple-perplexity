"use client";

import { themeService } from "@/services/themeService";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  // 初始化主题服务
  useEffect(() => {
    // 预加载主题资源
    themeService.preloadThemeResources();

    // 清理函数
    return () => {
      themeService.cleanup();
    };
  }, []);

  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
