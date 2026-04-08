import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { DashboardResponse } from "../types/api";

export const useDashboard = (walletId?: string, timeRange: string = "current_month") => {
  return useQuery({
    queryKey: ["dashboard", walletId, timeRange],
    queryFn: () => 
      fetcher<DashboardResponse>(`/dashboard/summary?walletId=${walletId || ""}&timeRange=${timeRange}`),
    enabled: !!walletId, // Chỉ fetch khi có walletId (hoặc logic mặc định của bạn)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
