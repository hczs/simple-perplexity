// API 数据模型
export interface ChatRequest {
  question: string;
}

export interface SSEEvent {
  event_name: "tool_event" | "chat_event";
  tool_name?: "current_time" | "tavily_search";
  tool_param?: string;
  tool_result?: string;
  content?: string;
}

// 工具调用事件
export interface ToolEvent extends SSEEvent {
  event_name: "tool_event";
  tool_name: "current_time" | "tavily_search";
  tool_param: string;
  tool_result: string;
}

// 对话内容事件
export interface ChatEvent extends SSEEvent {
  event_name: "chat_event";
  content: string;
}