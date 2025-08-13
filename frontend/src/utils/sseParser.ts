import { ChatEvent, SSEEvent, ToolEvent } from '@/types/api';

/**
 * SSE 解析工具函数
 */

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
 * 解析 SSE 数据行
 */
export function parseSSELine(line: string): { type: string; data: string } | null {
  const trimmed = line.trim();
  
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('data:')) {
    return {
      type: 'data',
      data: trimmed.substring(5).trim(),
    };
  }

  if (trimmed.startsWith('event:')) {
    return {
      type: 'event',
      data: trimmed.substring(6).trim(),
    };
  }

  if (trimmed.startsWith('id:')) {
    return {
      type: 'id',
      data: trimmed.substring(3).trim(),
    };
  }

  if (trimmed.startsWith('retry:')) {
    return {
      type: 'retry',
      data: trimmed.substring(6).trim(),
    };
  }

  return null;
}

/**
 * 验证 SSE 事件数据完整性
 */
export function validateSSEEvent(event: any): event is SSEEvent {
  if (!event || typeof event !== 'object') {
    return false;
  }

  const { event_name } = event;

  if (!event_name || typeof event_name !== 'string') {
    return false;
  }

  if (event_name === 'tool_event') {
    return typeof event.tool_name === 'string' &&
           (event.tool_param === undefined || typeof event.tool_param === 'string') &&
           (event.tool_result === undefined || typeof event.tool_result === 'string');
  }

  if (event_name === 'chat_event') {
    return typeof event.content === 'string';
  }

  return false;
}