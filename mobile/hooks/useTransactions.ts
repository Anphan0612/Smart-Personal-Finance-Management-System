import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, poster } from "../services/api";
import { Transaction } from "../types";

export const useTransactions = (walletId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch danh sách giao dịch
  const transactionsQuery = useQuery({
    queryKey: ["transactions", walletId],
    queryFn: () => fetcher<Transaction[]>(`/transactions?walletId=${walletId}`),
    enabled: !!walletId,
  });

  // Mutation để tạo giao dịch mới
  const createTransactionMutation = useMutation({
    mutationFn: (newTransaction: Partial<Transaction>) => 
      poster<Transaction, Partial<Transaction>>("/transactions", newTransaction),
    onSuccess: () => {
      // Refresh danh sách và số dư ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    refetch: transactionsQuery.refetch,
    error: transactionsQuery.error,
    createTransaction: createTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
  };
};
