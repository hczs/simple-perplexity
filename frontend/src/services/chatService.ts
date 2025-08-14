import { ChatRequest, SSEEvent } from '@/types/api';
import { ChatError } from '@/types/errors';
import { SSEParseError, createSSEProcessor, parseSSEEvent as parseSSEEventUtil } from '@/utils/sseParser';

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
    const result = parseSSEEventUtil(data);
    
    if (result.success && result.event) {
      return result.event;
    }
    
    if (result.error) {
      console.warn('SSE parsing error:', result.error);
    }
    
    return null;
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
    
    // 使用新的 SSE 处理器
    const processor = createSSEProcessor(
      onEvent,
      (parseError: SSEParseError) => {
        onError(this.createChatError('validation', `SSE parsing error: ${parseError.message}`, parseError.type));
      }
    );

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            processor.finish(); // 处理缓冲区中剩余的数据
            onComplete();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          processor.processChunk(chunk);
        }
      } catch (error) {
        processor.reset(); // 重置处理器状态
        onError(this.createChatError('connection', `Stream reading failed: ${(error as Error).message}`));
      }
    };

    processStream();
    return reader;
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