import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { TransactionResponse } from "../types/api";

export const useTransactions = (walletId?: string) => {
  return useQuery({
    queryKey: ["transactions", walletId],
    queryFn: () => 
      fetcher<TransactionResponse[]>(`/transactions?walletId=${walletId || ""}`),
    enabled: !!walletId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
