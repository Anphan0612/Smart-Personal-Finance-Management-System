import { useState, useCallback } from 'react';
import { generateId, ID_PREFIX } from '../../../utils/id';
import { useAppStore, ChatMessage } from '../../../store/useAppStore';
import { poster } from '../../../services/api';
import * as Haptics from 'expo-haptics';

interface ChatResponse {
  message: string;
  data?: any;
  type?: ChatMessage['type'];
}

export const useAtelierChat = () => {
  const { messages, addMessage, activeWalletId } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isProcessing) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      addMessage({
        id: generateId(ID_PREFIX.MESSAGE),
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      setIsProcessing(true);

      try {
        const response = await poster<ChatResponse, any>('/ai/chat', {
          message: userMessage,
          walletId: activeWalletId,
        });

        if (response && response.message) {
          addMessage({
            id: generateId(ID_PREFIX.MESSAGE),
            role: 'assistant',
            content: response.message,
            data: response.data,
            type: response.type,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        addMessage({
          id: generateId(ID_PREFIX.MESSAGE),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, addMessage, activeWalletId]
  );

  return {
    messages,
    isProcessing,
    sendMessage,
  };
};
