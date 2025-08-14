import { chatService } from '@/services/chatService';
import { ChatEvent, SSEEvent, ToolEvent } from '@/types/api';
import { ChatState, Message, ToolCall } from '@/types/chat';
import { ChatError } from '@/types/errors';
import { useCallback, useEffect, useReducer, useRef } from 'react';

// Action types for chat state management
type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { message: string; messageId?: string } }
  | { type: 'MESSAGE_SENT'; payload: { messageId: string } }
  | { type: 'START_STREAMING'; payload: { messageId: string } }
  | { type: 'APPEND_STREAMING_CONTENT'; payload: { messageId: string; content: string } }
  | { type: 'COMPLETE_MESSAGE'; payload: { messageId: string } }
  | { type: 'ADD_TOOL_CALL_TO_MESSAGE'; payload: { messageId: string; toolCall: ToolCall } }
  | { type: 'UPDATE_TOOL_CALL_IN_MESSAGE'; payload: { messageId: string; toolCallId: string; result: string; status: 'complete' } }
  | { type: 'SET_CONNECTION_STATUS'; payload: { isConnected: boolean } }
  | { type: 'SET_STREAMING_STATUS'; payload: { isStreaming: boolean } }
  | { type: 'SET_SENDING_STATUS'; payload: { isSending: boolean } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'RESET_CHAT' };

// Initial state
const initialState: ChatState = {
  messages: [],
  isConnected: false,
  isStreaming: false,
  isSending: false,
  error: null,
};



// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Chat reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const newMessage: Message = {
        id: action.payload.messageId || generateId(),
        type: 'user',
        content: action.payload.message,
        timestamp: Date.now(),
        status: 'sending',
      };
      return {
        ...state,
        messages: [...state.messages, newMessage],
        isSending: true,
        error: null,
      };
    }

    case 'MESSAGE_SENT': {
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, status: 'sent' as const }
            : msg
        ),
        isSending: false,
      };
    }

    case 'START_STREAMING': {
      const assistantMessage: Message = {
        id: action.payload.messageId,
        type: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'streaming',
      };
      return {
        ...state,
        messages: [...state.messages, assistantMessage],
        isStreaming: true,
      };
    }

    case 'APPEND_STREAMING_CONTENT': {
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, content: msg.content + action.payload.content }
            : msg
        ),
      };
    }

    case 'COMPLETE_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, status: 'complete' as const }
            : msg
        ),
        isStreaming: false,
      };
    }

    case 'ADD_TOOL_CALL_TO_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? {
                ...msg,
                toolCalls: [...(msg.toolCalls || []), action.payload.toolCall],
              }
            : msg
        ),
      };
    }

    case 'UPDATE_TOOL_CALL_IN_MESSAGE': {
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map(toolCall =>
                  toolCall.id === action.payload.toolCallId
                    ? {
                        ...toolCall,
                        result: action.payload.result,
                        status: action.payload.status,
                      }
                    : toolCall
                ),
              }
            : msg
        ),
      };
    }

    case 'SET_CONNECTION_STATUS': {
      return {
        ...state,
        isConnected: action.payload.isConnected,
      };
    }

    case 'SET_STREAMING_STATUS': {
      return {
        ...state,
        isStreaming: action.payload.isStreaming,
      };
    }

    case 'SET_SENDING_STATUS': {
      return {
        ...state,
        isSending: action.payload.isSending,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload.error,
        isStreaming: false,
        isSending: false,
        isConnected: false,
      };
    }

    case 'RESET_CHAT': {
      return initialState;
    }

    default:
      return state;
  }
};

export interface UseChatReturn {
  // State
  messages: Message[];
  isConnected: boolean;
  isStreaming: boolean;
  isSending: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  resetChat: () => void;
  clearError: () => void;
}

export const useChat = (): UseChatReturn => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const currentAssistantMessageIdRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (readerRef.current) {
      chatService.cleanup(readerRef.current);
      readerRef.current = null;
    }
    currentAssistantMessageIdRef.current = null;
  }, []);

  // Handle SSE events
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.event_name === 'tool_event') {
      const toolEvent = event as ToolEvent;
      
      // 确保有当前的助手消息
      if (!currentAssistantMessageIdRef.current) {
        const messageId = generateId();
        currentAssistantMessageIdRef.current = messageId;
        dispatch({
          type: 'START_STREAMING',
          payload: { messageId },
        });
      }

      const messageId = currentAssistantMessageIdRef.current;
      const currentMessage = state.messages.find(msg => msg.id === messageId);
      
      // 查找现有的工具调用
      const existingToolCall = currentMessage?.toolCalls?.find(
        tc => tc.name === toolEvent.tool_name && tc.param === toolEvent.tool_param
      );

      if (existingToolCall && toolEvent.tool_result) {
        // 更新现有工具调用
        dispatch({
          type: 'UPDATE_TOOL_CALL_IN_MESSAGE',
          payload: {
            messageId,
            toolCallId: existingToolCall.id,
            result: toolEvent.tool_result,
            status: 'complete',
          },
        });
      } else if (!existingToolCall) {
        // 创建新的工具调用
        const newToolCall: ToolCall = {
          id: generateId(),
          name: toolEvent.tool_name,
          param: toolEvent.tool_param || '',
          result: toolEvent.tool_result,
          status: toolEvent.tool_result ? 'complete' : 'calling',
        };

        dispatch({
          type: 'ADD_TOOL_CALL_TO_MESSAGE',
          payload: { messageId, toolCall: newToolCall },
        });
      }
    } else if (event.event_name === 'chat_event') {
      const chatEvent = event as ChatEvent;
      
      // Start streaming if this is the first content
      if (!currentAssistantMessageIdRef.current) {
        const messageId = generateId();
        currentAssistantMessageIdRef.current = messageId;
        dispatch({
          type: 'START_STREAMING',
          payload: { messageId },
        });
      }

      // 追加流式内容而不是替换
      if (currentAssistantMessageIdRef.current && chatEvent.content) {
        dispatch({
          type: 'APPEND_STREAMING_CONTENT',
          payload: {
            messageId: currentAssistantMessageIdRef.current,
            content: chatEvent.content,
          },
        });
      }
    }
  }, [state.messages]);

  // Handle SSE errors
  const handleSSEError = useCallback((error: ChatError) => {
    dispatch({
      type: 'SET_ERROR',
      payload: { error: error.message },
    });
    cleanup();
  }, [cleanup]);

  // Handle SSE completion
  const handleSSEComplete = useCallback(() => {
    // Complete the current assistant message
    if (currentAssistantMessageIdRef.current) {
      dispatch({
        type: 'COMPLETE_MESSAGE',
        payload: { messageId: currentAssistantMessageIdRef.current },
      });
    }

    // Update connection status
    dispatch({
      type: 'SET_CONNECTION_STATUS',
      payload: { isConnected: false },
    });

    cleanup();
  }, [cleanup]);

  // Send message function
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.isStreaming) {
      return;
    }

    const userMessageId = generateId();

    try {
      // Add user message
      dispatch({
        type: 'SEND_MESSAGE',
        payload: { message: message.trim(), messageId: userMessageId },
      });

      // Set connection status and streaming status
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: { isConnected: true },
      });

      dispatch({
        type: 'SET_STREAMING_STATUS',
        payload: { isStreaming: true },
      });

      // Send message and get stream
      const stream = await chatService.sendMessage(message.trim());

      // Mark user message as sent
      dispatch({
        type: 'MESSAGE_SENT',
        payload: { messageId: userMessageId },
      });

      // Create SSE reader
      readerRef.current = chatService.createSSEReader(
        stream,
        handleSSEEvent,
        handleSSEError,
        handleSSEComplete
      );

    } catch (error) {
      const chatError = error as ChatError;
      dispatch({
        type: 'SET_ERROR',
        payload: { error: chatError.message },
      });
      cleanup();
    }
  }, [state.isStreaming, handleSSEEvent, handleSSEError, handleSSEComplete, cleanup]);

  // Reset chat function
  const resetChat = useCallback(() => {
    cleanup();
    dispatch({ type: 'RESET_CHAT' });
  }, [cleanup]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({
      type: 'SET_ERROR',
      payload: { error: null },
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    messages: state.messages,
    isConnected: state.isConnected,
    isStreaming: state.isStreaming,
    isSending: state.isSending,
    error: state.error,
    
    // Actions
    sendMessage,
    resetChat,
    clearError,
  };
};