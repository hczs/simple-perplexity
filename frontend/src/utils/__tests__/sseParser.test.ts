import { ChatEvent, SSEEvent, ToolEvent } from '@/types/api';
import {
    SSEParseError,
    createSSEProcessor,
    getToolDisplayText,
    isChatEvent,
    isToolCalling,
    isToolComplete,
    isToolEvent,
    parseSSEEvent,
    parseSSELine,
    processSSEStream,
    validateSSEEvent
} from '../sseParser';

describe('SSE Parser', () => {
  describe('parseSSEEvent', () => {
    it('should parse valid tool event', () => {
      const data = 'data: {"event_name":"tool_event","tool_name":"current_time","tool_param":"","tool_result":""}';
      const result = parseSSEEvent(data);
      
      expect(result.success).toBe(true);
      expect(result.event).toEqual({
        event_name: 'tool_event',
        tool_name: 'current_time',
        tool_param: '',
        tool_result: ''
      });
    });

    it('should parse valid chat event', () => {
      const data = 'data: {"event_name":"chat_event","content":"Hello world"}';
      const result = parseSSEEvent(data);
      
      expect(result.success).toBe(true);
      expect(result.event).toEqual({
        event_name: 'chat_event',
        content: 'Hello world'
      });
    });

    it('should handle invalid JSON', () => {
      const data = 'data: {invalid json}';
      const result = parseSSEEvent(data);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('invalid_json');
    });

    it('should handle empty data', () => {
      const data = '';
      const result = parseSSEEvent(data);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('invalid_format');
    });

    it('should handle [DONE] marker', () => {
      const data = 'data: [DONE]';
      const result = parseSSEEvent(data);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('invalid_json');
    });

    it('should handle data without prefix', () => {
      const data = '{"event_name":"chat_event","content":"test"}';
      const result = parseSSEEvent(data);
      
      expect(result.success).toBe(true);
      expect(result.event?.event_name).toBe('chat_event');
    });
  });

  describe('validateSSEEvent', () => {
    it('should validate tool event with all fields', () => {
      const event = {
        event_name: 'tool_event',
        tool_name: 'current_time',
        tool_param: 'param',
        tool_result: 'result'
      };
      
      const result = validateSSEEvent(event);
      expect(result.isValid).toBe(true);
    });

    it('should validate tool event with minimal fields', () => {
      const event = {
        event_name: 'tool_event',
        tool_name: 'tavily_search'
      };
      
      const result = validateSSEEvent(event);
      expect(result.isValid).toBe(true);
    });

    it('should validate chat event', () => {
      const event = {
        event_name: 'chat_event',
        content: 'Hello'
      };
      
      const result = validateSSEEvent(event);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid tool name', () => {
      const event = {
        event_name: 'tool_event',
        tool_name: 'invalid_tool'
      };
      
      const result = validateSSEEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid tool_name');
    });

    it('should reject missing event_name', () => {
      const event = {
        content: 'Hello'
      };
      
      const result = validateSSEEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('event_name');
    });

    it('should reject chat event without content', () => {
      const event = {
        event_name: 'chat_event'
      };
      
      const result = validateSSEEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('content');
    });
  });

  describe('parseSSELine', () => {
    it('should parse data line', () => {
      const line = 'data: {"test": "value"}';
      const result = parseSSELine(line);
      
      expect(result).toEqual({
        type: 'data',
        data: '{"test": "value"}'
      });
    });

    it('should parse event line', () => {
      const line = 'event: message';
      const result = parseSSELine(line);
      
      expect(result).toEqual({
        type: 'event',
        data: 'message'
      });
    });

    it('should parse id line', () => {
      const line = 'id: 123';
      const result = parseSSELine(line);
      
      expect(result).toEqual({
        type: 'id',
        data: '123'
      });
    });

    it('should parse retry line', () => {
      const line = 'retry: 3000';
      const result = parseSSELine(line);
      
      expect(result).toEqual({
        type: 'retry',
        data: '3000'
      });
    });

    it('should parse comment line', () => {
      const line = ': this is a comment';
      const result = parseSSELine(line);
      
      expect(result).toEqual({
        type: 'comment',
        data: 'this is a comment'
      });
    });

    it('should return null for empty line', () => {
      const line = '';
      const result = parseSSELine(line);
      
      expect(result).toBeNull();
    });

    it('should return null for invalid line', () => {
      const line = 'invalid line format';
      const result = parseSSELine(line);
      
      expect(result).toBeNull();
    });
  });

  describe('processSSEStream', () => {
    it('should process multiple events', () => {
      const rawData = `data: {"event_name":"tool_event","tool_name":"current_time","tool_param":"","tool_result":""}
data: {"event_name":"chat_event","content":"Hello"}`;
      
      const events: SSEEvent[] = [];
      const errors: SSEParseError[] = [];
      
      processSSEStream(
        rawData,
        (event) => events.push(event),
        (error) => errors.push(error)
      );
      
      expect(events).toHaveLength(2);
      expect(events[0].event_name).toBe('tool_event');
      expect(events[1].event_name).toBe('chat_event');
      expect(errors).toHaveLength(0);
    });

    it('should handle mixed valid and invalid events', () => {
      const rawData = `data: {"event_name":"chat_event","content":"Hello"}
data: {invalid json}
data: {"event_name":"tool_event","tool_name":"current_time"}`;
      
      const events: SSEEvent[] = [];
      const errors: SSEParseError[] = [];
      
      processSSEStream(
        rawData,
        (event) => events.push(event),
        (error) => errors.push(error)
      );
      
      expect(events).toHaveLength(2);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('invalid_json');
    });
  });

  describe('createSSEProcessor', () => {
    it('should process chunks incrementally', () => {
      const events: SSEEvent[] = [];
      const errors: SSEParseError[] = [];
      
      const processor = createSSEProcessor(
        (event) => events.push(event),
        (error) => errors.push(error)
      );
      
      // 模拟分块数据
      processor.processChunk('data: {"event_name":"chat_event",');
      processor.processChunk('"content":"Hello"}\n');
      processor.processChunk('data: {"event_name":"tool_event","tool_name":"current_time"}\n');
      
      expect(events).toHaveLength(2);
      expect(events[0].event_name).toBe('chat_event');
      expect(events[1].event_name).toBe('tool_event');
    });

    it('should handle incomplete data in buffer', () => {
      const events: SSEEvent[] = [];
      const errors: SSEParseError[] = [];
      
      const processor = createSSEProcessor(
        (event) => events.push(event),
        (error) => errors.push(error)
      );
      
      processor.processChunk('data: {"event_name":"chat_event","content":"Hello"}');
      processor.finish();
      
      expect(events).toHaveLength(1);
      expect(events[0].event_name).toBe('chat_event');
    });

    it('should reset buffer correctly', () => {
      const events: SSEEvent[] = [];
      const errors: SSEParseError[] = [];
      
      const processor = createSSEProcessor(
        (event) => events.push(event),
        (error) => errors.push(error)
      );
      
      processor.processChunk('data: {"event_name":"chat_event","content":"Hello"}\n');
      processor.reset();
      processor.processChunk('data: {"event_name":"tool_event","tool_name":"current_time"}\n');
      
      expect(events).toHaveLength(2);
    });
  });

  describe('Type Guards', () => {
    const toolEvent: ToolEvent = {
      event_name: 'tool_event',
      tool_name: 'current_time',
      tool_param: '',
      tool_result: ''
    };

    const chatEvent: ChatEvent = {
      event_name: 'chat_event',
      content: 'Hello'
    };

    it('should identify tool events', () => {
      expect(isToolEvent(toolEvent)).toBe(true);
      expect(isToolEvent(chatEvent)).toBe(false);
    });

    it('should identify chat events', () => {
      expect(isChatEvent(chatEvent)).toBe(true);
      expect(isChatEvent(toolEvent)).toBe(false);
    });

    it('should identify calling tools', () => {
      const callingTool = { ...toolEvent, tool_result: '' };
      const completeTool = { ...toolEvent, tool_result: 'result' };
      
      expect(isToolCalling(callingTool)).toBe(true);
      expect(isToolCalling(completeTool)).toBe(false);
    });

    it('should identify complete tools', () => {
      const callingTool = { ...toolEvent, tool_result: '' };
      const completeTool = { ...toolEvent, tool_result: 'result' };
      
      expect(isToolComplete(callingTool)).toBe(false);
      expect(isToolComplete(completeTool)).toBe(true);
    });
  });

  describe('getToolDisplayText', () => {
    it('should generate current_time calling text', () => {
      const text = getToolDisplayText('current_time', '', '', false);
      expect(text).toBe('正在获取当前时间');
    });

    it('should generate current_time complete text', () => {
      const text = getToolDisplayText('current_time', '', '2025-08-13 21:21:43', true);
      expect(text).toBe('获取到当前时间为 2025-08-13 21:21:43');
    });

    it('should generate tavily_search calling text', () => {
      const text = getToolDisplayText('tavily_search', '北京天气', '', false);
      expect(text).toBe('正在搜索 北京天气');
    });

    it('should generate tavily_search complete text', () => {
      const result = '结果1\n结果2\n结果3';
      const text = getToolDisplayText('tavily_search', '北京天气', result, true);
      expect(text).toBe('搜索到 3 个结果，正在生成回答');
    });

    it('should handle unknown tools', () => {
      const callingText = getToolDisplayText('unknown_tool', 'param', '', false);
      const completeText = getToolDisplayText('unknown_tool', 'param', 'result', true);
      
      expect(callingText).toBe('正在调用 unknown_tool');
      expect(completeText).toBe('unknown_tool 调用完成');
    });
  });
});