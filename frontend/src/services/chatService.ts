import { ChatRequest, SSEEvent } from '@/types/api';
import { ChatError } from '@/types/errors';

export class ChatService {
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    baseUrl: string = 'http://localhost:8000',
    maxRetries: number = 3,
    retryDelay: number = 1000
  ) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * 发送消息并返回 SSE 流
   */
  async sendMessage(question: string): Promise<ReadableStream<Uint8Array>> {
    const request: ChatRequest = { question };
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        return response.body;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    throw this.createChatError('connection', `Failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`);
  }

  /**
   * 解析 SSE 事件数据
   */
  parseSSEEvent(data: string): SSEEvent | null {
    try {
      // 移除 "data: " 前缀
      const cleanData = data.replace(/^data:\s*/, '').trim();
      
      if (!cleanData || cleanData === '[DONE]') {
        return null;
      }

      const parsed = JSON.parse(cleanData);
      
      // 验证事件格式
      if (!this.isValidSSEEvent(parsed)) {
        console.warn('Invalid SSE event format:', parsed);
        return null;
      }

      return parsed as SSEEvent;
    } catch (error) {
      console.error('Failed to parse SSE event:', error, 'Data:', data);
      return null;
    }
  }

  /**
   * 创建 SSE 流读取器
   */
  createSSEReader(
    stream: ReadableStream<Uint8Array>,
    onEvent: (event: SSEEvent) => void,
    onError: (error: ChatError) => void,
    onComplete: () => void
  ): ReadableStreamDefaultReader<Uint8Array> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

          for (const line of lines) {
            if (line.trim() && line.startsWith('data:')) {
              const event = this.parseSSEEvent(line);
              if (event) {
                onEvent(event);
              }
            }
          }
        }
      } catch (error) {
        onError(this.createChatError('connection', `Stream reading failed: ${(error as Error).message}`));
      }
    };

    processStream();
    return reader;
  }

  /**
   * 验证 SSE 事件格式
   */
  private isValidSSEEvent(data: any): boolean {
    return validateSSEEvent(data);
  }

  /**
   * 创建标准化的聊天错误
   */
  private createChatError(
    type: ChatError['type'],
    message: string,
    code?: string
  ): ChatError {
    return {
      type,
      message,
      code,
      timestamp: Date.now(),
    };
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 取消请求（清理资源）
   */
  cleanup(reader?: ReadableStreamDefaultReader<Uint8Array>): void {
    if (reader) {
      reader.cancel().catch(console.error);
    }
  }
}

// 导出单例实例
export const chatService = new ChatService();