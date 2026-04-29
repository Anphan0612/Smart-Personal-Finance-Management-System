import { useQuery } from '@tanstack/react-query';
import { generateId, ID_PREFIX } from '../../../utils/id';
import { useAppStore } from '../../../store/useAppStore';
import { fetcher } from '../../../services/api';

/**
 * Fetches proactive AI insights when the Atelier AI panel opens.
 *
 * Refactored from raw useEffect+fetcher to React Query for:
 * - Built-in deduplication (prevents double calls in Strict Mode)
 * - Session caching (re-opening the panel doesn't re-fetch)
 * - Standardized loading/error states
 *
 * The query is only enabled when:
 * - The AI panel is open
 * - A wallet is selected
 * - No messages exist yet (first open)
 */
export const useProactiveInsights = (isOpen: boolean, activeWalletId: string | null) => {
  const { messages, addMessage } = useAppStore();

  const hasMessages = messages.length > 0;

  const query = useQuery({
    queryKey: ['ai', 'proactiveInsights', { walletId: activeWalletId }],
    queryFn: async () => {
      const response = await fetcher<{ message: string }>(
        `/ai/proactive-insights?walletId=${activeWalletId}`,
      );
      return response;
    },
    enabled: isOpen && !!activeWalletId && !hasMessages,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  // Add the insight message to the chat store when data arrives
  if (query.data?.message && !hasMessages) {
    addMessage({
      id: generateId(ID_PREFIX.MESSAGE),
      role: 'assistant',
      content: query.data.message,
      timestamp: Date.now(),
    });
  }

  return query;
};
