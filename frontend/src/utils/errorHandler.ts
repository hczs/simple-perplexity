import { ChatError } from '@/types/errors';

/**
 * 错误处理工具函数
 */

/**
 * 创建聊天错误对象
 */
export function createChatError(
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
 * 判断是否为网络错误
 */
export function isNetworkError(error: Error): boolean {
  return error.name === 'TypeError' && 
         (error.message.includes('fetch') || 
          error.message.includes('network') ||
          error.message.includes('Failed to fetch'));
}

/**
 * 判断是否为超时错误
 */
export function isTimeoutError(error: Error): boolean {
  return error.name === 'AbortError' || 
         error.message.includes('timeout') ||
         error.message.includes('timed out');
}

/**
 * 判断是否为服务器错误
 */
export function isServerError(error: Error): boolean {
  return error.message.includes('HTTP 5') ||
         error.message.includes('Internal Server Error');
}

/**
 * 将通用错误转换为聊天错误
 */
export function convertToChatError(error: Error): ChatError {
  if (isNetworkError(error)) {
    return createChatError('connection', '网络连接失败，请检查网络设置');
  }

  if (isTimeoutError(error)) {
    return createChatError('timeout', '请求超时，请稍后重试');
  }

  if (isServerError(error)) {
    return createChatError('server', '服务器错误，请稍后重试');
  }

  return createChatError('server', error.message || '未知错误');
}

/**
 * 获取用户友好的错误消息
 */
export function getFriendlyErrorMessage(error: ChatError): string {
  const errorMessages = {
    connection: '网络连接失败，请检查网络设置后重试',
    timeout: '请求超时，请稍后重试',
    server: '服务器暂时不可用，请稍后重试',
    validation: '输入数据格式错误，请检查后重试',
  };

  return errorMessages[error.type] || error.message || '发生未知错误';
}

/**
 * 重试策略配置
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * 计算重试延迟时间（指数退避）
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error: ChatError): boolean {
  return error.type === 'connection' || 
         error.type === 'timeout' ||
         (error.type === 'server' && !error.code?.startsWith('4'));
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的异步函数执行器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      const chatError = convertToChatError(lastError);
      
      if (attempt === config.maxRetries || !isRetryableError(chatError)) {
        throw chatError;
      }

      const delayMs = calculateRetryDelay(attempt, config);
      await delay(delayMs);
    }
  }

  throw convertToChatError(lastError!);
}