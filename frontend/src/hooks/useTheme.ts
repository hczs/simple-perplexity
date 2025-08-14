'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';

/**
 * 主题管理 Hook
 * 基于 next-themes 的封装，提供统一的主题管理接口
 */
export function useTheme() {
  const { theme, setTheme: setNextTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [isLoading, setIsLoading] = useState(true);

  // 设置主题
  const setTheme = useCallback((theme: string) => {
    setNextTheme(theme);
  }, [setNextTheme]);

  // 切换主题（在 light、dark、system 之间循环）
  const toggleTheme = useCallback(() => {
    if (theme === "light") {
      setNextTheme("dark");
    } else if (theme === "dark") {
      setNextTheme("system");
    } else {
      setNextTheme("light");
    }
  }, [theme, setNextTheme]);

  // 在 light 和 dark 之间切换
  const toggleLightDark = useCallback(() => {
    const resolved = resolvedTheme === "dark" ? "light" : "dark";
    setNextTheme(resolved);
  }, [resolvedTheme, setNextTheme]);

  // 获取主题显示名称
  const getThemeDisplayName = useCallback((targetTheme?: string) => {
    const displayNames = {
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    };
    const themeToDisplay = targetTheme || theme || 'system';
    return displayNames[themeToDisplay as keyof typeof displayNames] || '未知';
  }, [theme]);

  // 检查是否支持系统主题
  const supportsSystemTheme = useCallback(() => {
    return typeof window !== 'undefined' && window.matchMedia !== undefined;
  }, []);

  // 初始化完成标记
  useEffect(() => {
    if (theme !== undefined) {
      setIsLoading(false);
    }
  }, [theme]);

  return {
    // 主题状态
    theme: theme as 'light' | 'dark' | 'system',
    systemTheme: systemTheme as 'light' | 'dark',
    resolvedTheme: resolvedTheme as 'light' | 'dark',
    isLoading,
    
    // 主题操作
    setTheme,
    toggleTheme,
    toggleLightDark,
    
    // 工具函数
    getThemeDisplayName,
    supportsSystemTheme,

    // 兼容性：提供完整配置对象
    themeConfig: {
      theme: theme as 'light' | 'dark' | 'system',
      systemTheme: systemTheme as 'light' | 'dark',
      resolvedTheme: resolvedTheme as 'light' | 'dark',
    },
  };
}

/**
 * 系统主题检测 Hook
 */
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return systemTheme;
}

/**
 * 主题持久化 Hook
 */
export function useThemePersistence() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    isHydrated,
  };
}

/**
 * 主题动画 Hook
 */
export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    
    // 动画持续时间后重置状态
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  }, []);

  return {
    isTransitioning,
    startTransition,
  };
}