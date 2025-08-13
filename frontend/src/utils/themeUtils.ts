import { Theme } from '@/types/theme';

/**
 * 主题工具函数
 */

/**
 * 获取主题对应的图标名称
 */
export function getThemeIcon(theme: Theme, resolvedTheme?: 'light' | 'dark'): string {
  switch (theme) {
    case 'light':
      return 'sun';
    case 'dark':
      return 'moon';
    case 'system':
      return resolvedTheme === 'dark' ? 'moon' : 'sun';
    default:
      return 'sun';
  }
}

/**
 * 获取下一个主题（用于切换）
 */
export function getNextTheme(currentTheme: Theme): Theme {
  const themeOrder: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = themeOrder.indexOf(currentTheme);
  return themeOrder[(currentIndex + 1) % themeOrder.length];
}

/**
 * 获取主题的 CSS 类名
 */
export function getThemeClassName(theme: 'light' | 'dark'): string {
  return theme;
}

/**
 * 检查是否为暗色主题
 */
export function isDarkTheme(resolvedTheme: 'light' | 'dark'): boolean {
  return resolvedTheme === 'dark';
}

/**
 * 获取主题对应的颜色值
 */
export function getThemeColors(theme: 'light' | 'dark') {
  const colors = {
    light: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      primary: '#0f172a',
      secondary: '#f1f5f9',
      accent: '#e2e8f0',
      muted: '#f8fafc',
      border: '#e2e8f0',
    },
    dark: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      primary: '#fafafa',
      secondary: '#1e293b',
      accent: '#334155',
      muted: '#0f172a',
      border: '#1e293b',
    },
  };

  return colors[theme];
}

/**
 * 生成主题相关的 CSS 变量
 */
export function generateThemeVariables(theme: 'light' | 'dark'): Record<string, string> {
  const colors = getThemeColors(theme);
  
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--primary': colors.primary,
    '--secondary': colors.secondary,
    '--accent': colors.accent,
    '--muted': colors.muted,
    '--border': colors.border,
  };
}

/**
 * 应用主题变量到元素
 */
export function applyThemeVariables(
  element: HTMLElement,
  theme: 'light' | 'dark'
): void {
  const variables = generateThemeVariables(theme);
  
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * 检测系统主题偏好
 */
export function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * 创建系统主题监听器
 */
export function createSystemThemeListener(
  callback: (theme: 'light' | 'dark') => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleChange);

  // 返回清理函数
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * 获取主题切换动画配置
 */
export function getThemeTransitionConfig() {
  return {
    duration: 200,
    easing: 'ease-in-out',
    properties: [
      'background-color',
      'color',
      'border-color',
      'box-shadow',
    ],
  };
}

/**
 * 应用主题切换动画
 */
export function applyThemeTransition(element: HTMLElement): void {
  const config = getThemeTransitionConfig();
  
  element.style.transition = config.properties
    .map(prop => `${prop} ${config.duration}ms ${config.easing}`)
    .join(', ');

  // 在动画完成后移除 transition
  setTimeout(() => {
    element.style.transition = '';
  }, config.duration);
}

/**
 * 验证主题值
 */
export function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && 
         ['light', 'dark', 'system'].includes(value);
}

/**
 * 获取主题的本地化名称
 */
export function getLocalizedThemeName(theme: Theme, locale: string = 'zh-CN'): string {
  const names = {
    'zh-CN': {
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    },
    'en-US': {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  };

  return names[locale as keyof typeof names]?.[theme] || theme;
}