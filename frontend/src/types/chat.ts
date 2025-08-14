// 前端数据模型
export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
  status: "sending" | "sent" | "streaming" | "complete" | "error";
}

export interface ToolCall {
  id: string;
  name: "current_time" | "tavily_search";
  param: string;
  result: string;
  timestamp: number;
  status: "calling" | "complete";
  displayName: string; // "正在获取当前时间" | "正在搜索"
}

export interface ChatState {
  messages: Message[];
  currentToolCalls: ToolCall[];
  isConnected: boolean;
  isStreaming: boolean;
  isSending: boolean;
  error: string | null;
}