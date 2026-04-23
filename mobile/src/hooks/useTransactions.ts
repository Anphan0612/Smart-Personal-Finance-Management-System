import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, poster, apiClient } from '@/services/api';
import { TransactionResponse, TransactionType, ApiResponse, PagedResponse } from '@/types/api';
import { useAppStore } from '@/store/useAppStore';

export const useTransactions = (walletId?: string) => {
  const token = useAppStore((state) => state.token);

  return useInfiniteQuery<PagedResponse<TransactionResponse>>({
    queryKey: ['transactions', walletId],
    queryFn: ({ pageParam = 0 }) =>
      fetcher<PagedResponse<TransactionResponse>>(
        `/transactions?walletId=${walletId || ''}&page=${pageParam}&size=50`,
      ),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    initialPageParam: 0,
    enabled: !!walletId && !!token,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export interface CreateTransactionRequest {
  walletId: string;
  categoryId: string;
  amount: number;
  description: string;
  type: TransactionType;
  transactionDate: string;
  destinationWalletId?: string;
}

export const useAddTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      poster<TransactionResponse, CreateTransactionRequest>('/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; request: Partial<CreateTransactionRequest> }) =>
      apiClient
        .put<ApiResponse<TransactionResponse>>(`/transactions/${data.id}`, data.request)
        .then((res: { data: ApiResponse<TransactionResponse> }) => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.id] });
    },
  });
};
