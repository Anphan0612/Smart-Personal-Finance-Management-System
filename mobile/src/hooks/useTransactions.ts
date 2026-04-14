import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, poster, apiClient } from "@/services/api";
import { TransactionResponse, TransactionType, ApiResponse } from "@/types/api";

export const useTransactions = (walletId?: string) => {
  return useQuery({
    queryKey: ["transactions", walletId],
    queryFn: () => 
      fetcher<TransactionResponse[]>(`/transactions?walletId=${walletId || ""}`),
    enabled: !!walletId,
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
      poster<TransactionResponse, CreateTransactionRequest>("/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; request: Partial<CreateTransactionRequest> }) =>
      apiClient.put<ApiResponse<TransactionResponse>>(`/transactions/${data.id}`, data.request).then((res: { data: ApiResponse<TransactionResponse> }) => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.id] });
    },
  });
};
