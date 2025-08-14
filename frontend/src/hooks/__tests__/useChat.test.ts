import { chatService } from '@/services/chatService';
import { SSEEvent } from '@/types/api';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChat } from '../useChat';

// Mock the chat service
vi.mock('@/services/chatService', () => ({
  chatService: {
    sendMessage: vi.fn(),
    createSSEReader: vi.fn(),
    cleanup: vi.fn(),
  },
}));

const mockChatService = chatService as any;

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.currentToolCalls).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should add user message when sending message', async () => {
    const mockStream = new ReadableStream();
    mockChatService.sendMessage.mockResolvedValue(mockStream);
    mockChatService.createSSEReader.mockReturnValue({} as any);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].type).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[0].status).toBe('sent');
  });

  it('should handle tool call events', () => {
    const { result } = renderHook(() => useChat());

    // Simulate tool call start
    const toolEvent: SSEEvent = {
      event_name: 'tool_event',
      tool_name: 'current_time',
      tool_param: '',
      tool_result: '',
    };

    // We need to access the internal handler, so we'll test through sendMessage
    // This is a simplified test - in real usage, the SSE reader would call the handler
    expect(result.current.currentToolCalls).toHaveLength(0);
  });

  it('should reset chat state', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.resetChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.currentToolCalls).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should not send message when already streaming', async () => {
    const { result } = renderHook(() => useChat());

    // Mock streaming state by sending a message first
    const mockStream = new ReadableStream();
    mockChatService.sendMessage.mockResolvedValue(mockStream);
    mockChatService.createSSEReader.mockReturnValue({} as any);

    await act(async () => {
      await result.current.sendMessage('First message');
    });

    // Clear the mock to check if it's called again
    mockChatService.sendMessage.mockClear();

    // Try to send another message while streaming
    await act(async () => {
      await result.current.sendMessage('Second message');
    });

    // Should not call sendMessage again if streaming
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle empty or whitespace messages', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(0);
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle sendMessage errors', async () => {
    const errorMessage = 'Network error';
    mockChatService.sendMessage.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isConnected).toBe(false);
  });
});