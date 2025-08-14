import { SSEEvent } from '@/types/api';
import { ChatService } from '../chatService';

import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    vi.clearAllMocks();
  });

  describe('parseSSEEvent', () => {
    it('should parse valid SSE event data', () => {
      const data = 'data: {"event_name":"chat_event","content":"Hello"}';
      const result = chatService.parseSSEEvent(data);
      
      expect(result).toEqual({
        event_name: 'chat_event',
        content: 'Hello'
      });
    });

    it('should return null for invalid data', () => {
      const data = 'data: {invalid json}';
      const result = chatService.parseSSEEvent(data);
      
      expect(result).toBeNull();
    });

    it('should return null for empty data', () => {
      const data = '';
      const result = chatService.parseSSEEvent(data);
      
      expect(result).toBeNull();
    });

    it('should handle [DONE] marker', () => {
      const data = 'data: [DONE]';
      const result = chatService.parseSSEEvent(data);
      
      expect(result).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should send message and return stream', async () => {
      const mockStream = new ReadableStream();
      const mockResponse = {
        ok: true,
        body: mockStream,
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello');
      
      expect(result).toBe(mockStream);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          }),
          body: JSON.stringify({ question: 'Hello' }),
        })
      );
    });

    it('should throw error for failed request', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      (fetch as any).mockResolvedValue(mockResponse);

      await expect(chatService.sendMessage('Hello')).rejects.toThrow();
    }, 10000);

    it('should retry on failure', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const chatServiceWithRetry = new ChatService('http://localhost:8000', 2, 100);
      
      await expect(chatServiceWithRetry.sendMessage('Hello')).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('createSSEReader', () => {
    it('should process SSE stream correctly', async () => {
      const events: SSEEvent[] = [];
      const errors: any[] = [];
      let completed = false;

      // Create a mock stream with test data
      const encoder = new TextEncoder();
      const testData = 'data: {"event_name":"chat_event","content":"Hello"}\n\ndata: {"event_name":"tool_event","tool_name":"current_time","tool_param":"","tool_result":""}\n\n';
      
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(testData));
          controller.close();
        }
      });

      chatService.createSSEReader(
        mockStream,
        (event) => events.push(event),
        (error) => errors.push(error),
        () => { completed = true; }
      );

      // Wait for stream processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events).toHaveLength(2);
      expect(events[0].event_name).toBe('chat_event');
      expect(events[1].event_name).toBe('tool_event');
      expect(errors).toHaveLength(0);
      expect(completed).toBe(true);
    });

    it('should handle parsing errors', async () => {
      const events: SSEEvent[] = [];
      const errors: any[] = [];
      let completed = false;

      const encoder = new TextEncoder();
      const testData = 'data: {invalid json}\n\n';
      
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(testData));
          controller.close();
        }
      });

      chatService.createSSEReader(
        mockStream,
        (event) => events.push(event),
        (error) => errors.push(error),
        () => { completed = true; }
      );

      // Wait for stream processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('validation');
      expect(completed).toBe(true);
    });
  });
});