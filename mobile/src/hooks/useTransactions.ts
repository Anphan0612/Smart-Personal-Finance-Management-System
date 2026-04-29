import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionType } from '@/types/api';
import { useAppStore } from '@/store/useAppStore';
import { Transaction } from '@/domain/entities/Transaction';
import { GetTransactionsUseCase } from '@/domain/usecases/GetTransactionsUseCase';
import { AddTransactionUseCase } from '@/domain/usecases/AddTransactionUseCase';
import { ApiTransactionRepository } from '@/infrastructure/repositories/ApiTransactionRepository';
import { PaginatedResult } from '@/domain/repositories/TransactionRepository';

const transactionRepository = new ApiTransactionRepository();
const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
const addTransactionUseCase = new AddTransactionUseCase(transactionRepository);

export const useTransactions = (walletId?: string) => {
  const token = useAppStore((state) => state.token);

  return useInfiniteQuery<PaginatedResult<Transaction>>({
    queryKey: ['transactions', walletId],
    queryFn: ({ pageParam = 0 }) =>
      getTransactionsUseCase.execute(
        { walletId },
        { page: pageParam as number, size: 50 }
      ),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    initialPageParam: 0,
    enabled: !!walletId && !!token,
    staleTime: 1000 * 60 * 2,
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
      addTransactionUseCase.execute(data),
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
      transactionRepository.updateTransaction(data.id, data.request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.id] });
    },
  });
};
