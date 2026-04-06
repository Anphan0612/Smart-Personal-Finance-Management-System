import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { TransactionComparisonResponse } from "../types/comparison";

export const useComparison = (walletId?: string) => {
  return useQuery({
    queryKey: ["transactions", "comparison", walletId],
    queryFn: () =>
      fetcher<TransactionComparisonResponse>(
        `/transactions/comparison?walletId=${walletId || ""}`
      ),
    enabled: !!walletId,
    staleTime: 1000 * 60 * 10, // 10 minutes (insufficiently frequent for Proactive AI)
  });
};
