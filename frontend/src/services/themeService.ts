import { Theme, ThemeConfig } from '@/types/theme';

/**
 * 主题服务类
 * 提供主题管理、切换和持久化功能
 */
export class ThemeService {
  private static instance: ThemeService;
  private listeners: Set<(theme: Theme) => void> = new Set();
  private currentTheme: Theme = 'system';
  private systemTheme: 'light' | 'dark' = 'light';

  private constructor() {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * 初始化主题设置
   */
  private initializeTheme(): void {
    if (typeof window === 'undefined') return;

    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.currentTheme = savedTheme;
    }

    // 检测系统主题
    this.updateSystemTheme();
    
    // 应用主题
    this.applyTheme();
  }

  /**
   * 设置系统主题监听器
   */
  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      this.systemTheme = e.matches ? 'dark' : 'light';
      if (this.currentTheme === 'system') {
        this.applyTheme();
        this.notifyListeners();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  }

  /**
   * 更新系统主题检测
   */
  private updateSystemTheme(): void {
    if (typeof window === 'undefined') return;

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.systemTheme = isDark ? 'dark' : 'light';
  }

  /**
   * 获取当前主题
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * 获取解析后的主题（将 system 解析为实际主题）
   */
  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }

  /**
   * 获取系统主题
   */
  getSystemTheme(): 'light' | 'dark' {
    return this.systemTheme;
  }

  /**
   * 获取完整主题配置
   */
  getThemeConfig(): ThemeConfig {
    return {
      theme: this.currentTheme,
      systemTheme: this.systemTheme,
      resolvedTheme: this.getResolvedTheme(),
    };
  }

  /**
   * 设置主题
   */
  setTheme(theme: Theme): void {
    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme();
    this.notifyListeners();
  }

  /**
   * 切换主题（在 light、dark、system 之间循环）
   */
  toggleTheme(): void {
    const themeOrder: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    this.setTheme(themeOrder[nextIndex]);
  }

  /**
   * 在 light 和 dark 之间切换（忽略 system）
   */
  toggleLightDark(): void {
    const resolvedTheme = this.getResolvedTheme();
    this.setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }

  /**
   * 应用主题到 DOM
   */
  private applyTheme(): void {
    if (typeof window === 'undefined') return;

    const resolvedTheme = this.getResolvedTheme();
    const root = document.documentElement;

    // 移除所有主题类
    root.classList.remove('light', 'dark');
    
    // 添加当前主题类
    root.classList.add(resolvedTheme);

    // 设置 data 属性（兼容性）
    root.setAttribute('data-theme', resolvedTheme);

    // 更新 meta theme-color
    this.updateMetaThemeColor(resolvedTheme);
  }

  /**
   * 更新 meta theme-color
   */
  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#0a0a0a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  /**
   * 保存主题到 localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * 验证主题值是否有效
   */
  private isValidTheme(theme: string): theme is Theme {
    return ['light', 'dark', 'system'].includes(theme);
  }

  /**
   * 订阅主题变化
   */
  subscribe(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentTheme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * 获取主题显示名称
   */
  getThemeDisplayName(theme?: Theme): string {
    const targetTheme = theme || this.currentTheme;
    const displayNames = {
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    };
    return displayNames[targetTheme];
  }

  /**
   * 检查是否支持系统主题检测
   */
  supportsSystemTheme(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia !== undefined;
  }

  /**
   * 预加载主题资源（如果需要）
   */
  preloadThemeResources(): void {
    // 预加载主题相关的 CSS 或图片资源
    // 这里可以根据需要实现具体的预加载逻辑
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.listeners.clear();
  }
}

// 导出单例实例
export const themeService = ThemeService.getInstance();