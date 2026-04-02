import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export interface DashboardSummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  transactionDate: string;
  categoryName?: string;
  iconName?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyTrend: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: Transaction[];
}

export const useDashboard = (walletId: string | null, timeRange: string = "current_month") => {
  const token = useAppStore(state => state.token);

  return useQuery({
    queryKey: ["dashboard", walletId, timeRange],
    queryFn: () => fetcher<DashboardData>(`/dashboard/summary?walletId=${walletId}&timeRange=${timeRange}`),
    enabled: !!walletId && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
