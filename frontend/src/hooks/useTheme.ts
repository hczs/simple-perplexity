'use client';

import { themeService } from '@/services/themeService';
import { Theme, ThemeConfig } from '@/types/theme';
import { useCallback, useEffect, useState } from 'react';

/**
 * 主题管理 Hook
 * 提供主题状态和操作方法
 */
export function useTheme() {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => 
    themeService.getThemeConfig()
  );

  const [isLoading, setIsLoading] = useState(true);

  // 更新主题配置
  const updateThemeConfig = useCallback(() => {
    setThemeConfig(themeService.getThemeConfig());
  }, []);

  // 设置主题
  const setTheme = useCallback((theme: Theme) => {
    themeService.setTheme(theme);
  }, []);

  // 切换主题
  const toggleTheme = useCallback(() => {
    themeService.toggleTheme();
  }, []);

  // 在 light 和 dark 之间切换
  const toggleLightDark = useCallback(() => {
    themeService.toggleLightDark();
  }, []);

  // 获取主题显示名称
  const getThemeDisplayName = useCallback((theme?: Theme) => {
    return themeService.getThemeDisplayName(theme);
  }, []);

  // 检查是否支持系统主题
  const supportsSystemTheme = useCallback(() => {
    return themeService.supportsSystemTheme();
  }, []);

  // 监听主题变化
  useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      updateThemeConfig();
    });

    // 初始化完成
    setIsLoading(false);

    return unsubscribe;
  }, [updateThemeConfig]);

  return {
    // 主题状态
    theme: themeConfig.theme,
    resolvedTheme: themeConfig.resolvedTheme,
    systemTheme: themeConfig.systemTheme,
    isLoading,

    // 主题操作
    setTheme,
    toggleTheme,
    toggleLightDark,

    // 工具方法
    getThemeDisplayName,
    supportsSystemTheme,

    // 完整配置
    themeConfig,
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