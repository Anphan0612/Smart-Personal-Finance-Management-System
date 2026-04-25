import { useEffect } from 'react';
import { generateId, ID_PREFIX } from '../../../utils/id';
import { useAppStore } from '../../../store/useAppStore';
import { fetcher } from '../../../services/api';

export const useProactiveInsights = (isOpen: boolean, activeWalletId: string | null) => {
  const { messages, addMessage } = useAppStore();

  useEffect(() => {
    if (!isOpen || !activeWalletId || messages.length > 0) return;

    const fetchInitialInsights = async () => {
      try {
        const response = await fetcher(`/ai/proactive-insights?walletId=${activeWalletId}`);
        if (response && response.message) {
          addMessage({
            id: generateId(ID_PREFIX.MESSAGE),
            role: 'assistant',
            content: response.message,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error fetching initial insights:', error);
      }
    };

    fetchInitialInsights();
  }, [isOpen, activeWalletId, messages.length, addMessage]);
};
