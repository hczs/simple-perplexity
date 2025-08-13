// 主题数据模型
export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  theme: Theme;
  systemTheme: "light" | "dark";
  resolvedTheme: "light" | "dark";
}