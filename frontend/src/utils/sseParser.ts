import { ChatEvent, SSEEvent, ToolEvent } from '@/types/api';

/**
 * SSE 解析工具函数
 */

/**
 * SSE 解析错误类型
 */
export interface SSEParseError {
  type: 'invalid_format' | 'invalid_json' | 'missing_field' | 'unknown_event';
  message: string;
  data?: string;
}

/**
 * SSE 解析结果
 */
export interface SSEParseResult {
  success: boolean;
  event?: SSEEvent;
  error?: SSEParseError;
}

/**
 * 主要的 SSE 事件解析函数
 * 处理完整的 SSE 数据解析流程，包括数据验证和错误处理
 */
export function parseSSEEvent(data: string): SSEParseResult {
  try {
    // 清理数据格式
    const cleanData = cleanSSEData(data);
    
    if (!cleanData) {
      return {
        success: false,
        error: {
          type: 'invalid_format',
          message: 'Empty or invalid SSE data format',
          data
        }
      };
    }

    // 解析 JSON
    let parsed: any;
    try {
      parsed = JSON.parse(cleanData);
    } catch (jsonError) {
      return {
        success: false,
        error: {
          type: 'invalid_json',
          message: `Failed to parse JSON: ${(jsonError as Error).message}`,
          data: cleanData
        }
      };
    }

    // 验证事件结构
    const validationResult = validateSSEEvent(parsed);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: {
          type: 'missing_field',
          message: validationResult.error || 'Invalid event structure',
          data: cleanData
        }
      };
    }

    return {
      success: true,
      event: parsed as SSEEvent
    };

  } catch (error) {
    return {
      success: false,
      error: {
        type: 'unknown_event',
        message: `Unexpected parsing error: ${(error as Error).message}`,
        data
      }
    };
  }
}

/**
 * 清理 SSE 数据格式
 */
function cleanSSEData(data: string): string | null {
  if (!data || typeof data !== 'string') {
    return null;
  }

  const trimmed = data.trim();
  
  // 处理空数据或结束标记
  if (!trimmed || trimmed === '[DONE]') {
    return null;
  }

  // 移除 "data: " 前缀
  if (trimmed.startsWith('data:')) {
    return trimmed.substring(5).trim();
  }

  // 如果没有前缀，假设是纯 JSON 数据
  return trimmed;
}

/**
 * 验证 SSE 事件数据完整性
 */
export function validateSSEEvent(event: any): { isValid: boolean; error?: string } {
  if (!event || typeof event !== 'object') {
    return { isValid: false, error: 'Event must be an object' };
  }

  const { event_name } = event;

  if (!event_name || typeof event_name !== 'string') {
    return { isValid: false, error: 'Missing or invalid event_name field' };
  }

  // 验证工具事件
  if (event_name === 'tool_event') {
    if (!event.tool_name || typeof event.tool_name !== 'string') {
      return { isValid: false, error: 'tool_event requires valid tool_name' };
    }

    const validToolNames = ['current_time', 'tavily_search'];
    if (!validToolNames.includes(event.tool_name)) {
      return { isValid: false, error: `Invalid tool_name: ${event.tool_name}` };
    }

    if (event.tool_param !== undefined && typeof event.tool_param !== 'string') {
      return { isValid: false, error: 'tool_param must be a string if provided' };
    }

    if (event.tool_result !== undefined && typeof event.tool_result !== 'string') {
      return { isValid: false, error: 'tool_result must be a string if provided' };
    }

    return { isValid: true };
  }

  // 验证聊天事件
  if (event_name === 'chat_event') {
    if (typeof event.content !== 'string') {
      return { isValid: false, error: 'chat_event requires valid content field' };
    }

    return { isValid: true };
  }

  return { isValid: false, error: `Unknown event_name: ${event_name}` };
}

/**
 * 检查是否为工具事件
 */
export function isToolEvent(event: SSEEvent): event is ToolEvent {
  return event.event_name === 'tool_event' && 
         typeof event.tool_name === 'string';
}

/**
 * 检查是否为聊天事件
 */
export function isChatEvent(event: SSEEvent): event is ChatEvent {
  return event.event_name === 'chat_event' && 
         typeof event.content === 'string';
}

/**
 * 检查工具是否正在调用（无结果）
 */
export function isToolCalling(event: ToolEvent): boolean {
  return !event.tool_result || event.tool_result.trim() === '';
}

/**
 * 检查工具调用是否完成（有结果）
 */
export function isToolComplete(event: ToolEvent): boolean {
  return Boolean(event.tool_result && event.tool_result.trim());
}

/**
 * 生成工具调用显示文本
 */
export function getToolDisplayText(
  toolName: string,
  param: string,
  result: string,
  isComplete: boolean
): string {
  const toolDisplayMap = {
    current_time: {
      calling: '正在获取当前时间',
      complete: (result: string) => `获取到当前时间为 ${result}`,
    },
    tavily_search: {
      calling: (param: string) => `正在搜索 ${param}`,
      complete: (result: string) => {
        const resultCount = result.split('\n').filter(line => line.trim()).length;
        return `搜索到 ${resultCount} 个结果，正在生成回答`;
      },
    },
  };

  const toolConfig = toolDisplayMap[toolName as keyof typeof toolDisplayMap];
  
  if (!toolConfig) {
    return isComplete ? `${toolName} 调用完成` : `正在调用 ${toolName}`;
  }

  if (isComplete) {
    return typeof toolConfig.complete === 'function' 
      ? toolConfig.complete(result)
      : toolConfig.complete;
  } else {
    return typeof toolConfig.calling === 'function'
      ? toolConfig.calling(param)
      : toolConfig.calling;
  }
}

/**
 * 解析单行 SSE 数据
 * 处理标准 SSE 格式的各种字段类型
 */
export function parseSSELine(line: string): { type: string; data: string } | null {
  const trimmed = line.trim();
  
  if (!trimmed) {
    return null;
  }

  // 处理数据行
  if (trimmed.startsWith('data:')) {
    return {
      type: 'data',
      data: trimmed.substring(5).trim(),
    };
  }

  // 处理事件类型行
  if (trimmed.startsWith('event:')) {
    return {
      type: 'event',
      data: trimmed.substring(6).trim(),
    };
  }

  // 处理 ID 行
  if (trimmed.startsWith('id:')) {
    return {
      type: 'id',
      data: trimmed.substring(3).trim(),
    };
  }

  // 处理重试间隔行
  if (trimmed.startsWith('retry:')) {
    return {
      type: 'retry',
      data: trimmed.substring(6).trim(),
    };
  }

  // 处理注释行
  if (trimmed.startsWith(':')) {
    return {
      type: 'comment',
      data: trimmed.substring(1).trim(),
    };
  }

  return null;
}

/**
 * 批量处理 SSE 数据流
 * 将原始流数据转换为结构化的 SSE 事件
 */
export function processSSEStream(
  rawData: string,
  onEvent: (event: SSEEvent) => void,
  onError: (error: SSEParseError) => void
): void {
  const lines = rawData.split('\n');
  
  for (const line of lines) {
    const parsedLine = parseSSELine(line);
    
    if (parsedLine && parsedLine.type === 'data') {
      const result = parseSSEEvent(parsedLine.data);
      
      if (result.success && result.event) {
        onEvent(result.event);
      } else if (result.error) {
        onError(result.error);
      }
    }
  }
}

/**
 * 创建 SSE 流处理器
 * 提供完整的流处理功能，包括缓冲区管理和错误处理
 */
export function createSSEProcessor(
  onEvent: (event: SSEEvent) => void,
  onError: (error: SSEParseError) => void
) {
  let buffer = '';
  
  return {
    /**
     * 处理新的数据块
     */
    processChunk(chunk: string): void {
      buffer += chunk;
      const lines = buffer.split('\n');
      
      // 保留最后一行（可能不完整）
      buffer = lines.pop() || '';
      
      // 处理完整的行
      for (const line of lines) {
        const parsedLine = parseSSELine(line);
        
        if (parsedLine && parsedLine.type === 'data') {
          const result = parseSSEEvent(parsedLine.data);
          
          if (result.success && result.event) {
            onEvent(result.event);
          } else if (result.error) {
            onError(result.error);
          }
        }
      }
    },
    
    /**
     * 完成处理（处理缓冲区中剩余的数据）
     */
    finish(): void {
      if (buffer.trim()) {
        const parsedLine = parseSSELine(buffer);
        
        if (parsedLine && parsedLine.type === 'data') {
          const result = parseSSEEvent(parsedLine.data);
          
          if (result.success && result.event) {
            onEvent(result.event);
          } else if (result.error) {
            onError(result.error);
          }
        }
      }
      
      buffer = '';
    },
    
    /**
     * 重置处理器状态
     */
    reset(): void {
      buffer = '';
    }
  };
}