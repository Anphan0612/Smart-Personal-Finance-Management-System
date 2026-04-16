import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { DashboardResponse } from "../types/api";
import { useAppStore } from "../store/useAppStore";

export const useDashboard = (walletId?: string, timeRange: string = "current_month") => {
  const token = useAppStore((state) => state.token);

  return useQuery({
    queryKey: ["dashboard", walletId, timeRange],
    queryFn: () =>
      fetcher<DashboardResponse>(`/dashboard/summary?walletId=${walletId || ""}&timeRange=${timeRange}`),
    enabled: !!walletId && !!token, // Only fetch when both walletId and token exist
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
