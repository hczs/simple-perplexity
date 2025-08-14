// 工具调用接口
export interface ToolCall {
  id: string;
  name: "current_time" | "tavily_search";
  param: string;
  result?: string;
  status: "calling" | "complete";
}

// 消息接口 - 重新设计
export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
  status: "sending" | "sent" | "streaming" | "complete" | "error";
  toolCalls?: ToolCall[]; // 工具调用作为消息的一部分
}

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isStreaming: boolean;
  isSending: boolean;
  error: string | null;
}