// API 常量
export const API_BASE_URL = "http://localhost:8000";
export const CHAT_ENDPOINT = "/api/chat";

// 工具调用显示文本
export const TOOL_DISPLAY_MAP = {
  current_time: {
    calling: "正在获取当前时间",
    complete: (result: string) => `获取到当前时间为 ${result}`,
  },
  tavily_search: {
    calling: (param: string) => `正在搜索 ${param}`,
    complete: (result: string) => {
      const resultCount = result.split("\n").length;
      return `搜索到 ${resultCount} 个结果，正在生成回答`;
    },
  },
} as const;

// 主题常量
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

// 消息状态
export const MESSAGE_STATUS = {
  SENDING: "sending",
  SENT: "sent",
  STREAMING: "streaming",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

// 工具调用状态
export const TOOL_CALL_STATUS = {
  CALLING: "calling",
  COMPLETE: "complete",
} as const;