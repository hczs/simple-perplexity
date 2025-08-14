// 错误类型定义
export interface ChatError {
  type: "connection" | "timeout" | "server" | "validation";
  message: string;
  code?: string;
  timestamp: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}