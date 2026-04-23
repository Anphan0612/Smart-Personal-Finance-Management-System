import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../services/api';
import { TransactionComparisonResponse } from '../types/comparison';
import { useAppStore } from '../store/useAppStore';

export const useComparison = (walletId?: string) => {
  const token = useAppStore((state) => state.token);

  return useQuery({
    queryKey: ['transactions', 'comparison', walletId],
    queryFn: () =>
      fetcher<TransactionComparisonResponse>(`/transactions/comparison?walletId=${walletId || ''}`),
    enabled: !!walletId && !!token, // Only fetch when both walletId and token exist
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
