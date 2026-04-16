import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { BudgetResponse, BudgetPlanningResponse, ApiResponse } from "../types/api";
import { useAppStore } from "../store/useAppStore";

export const useBudgets = (month?: number, year?: number) => {
  const token = useAppStore((state) => state.token);
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  return useQuery({
    queryKey: ["budgets", m, y],
    queryFn: () =>
      fetcher<BudgetResponse[]>(`/budgets?month=${m}&year=${y}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!token, // Only fetch when token exists
  });
};

export const useBudgetPlanning = (month?: number, year?: number) => {
  const token = useAppStore((state) => state.token);
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  return useQuery({
    queryKey: ["budget-planning", m, y],
    queryFn: () =>
      fetcher<BudgetPlanningResponse>(`/budgets/planning?month=${m}&year=${y}`),
    staleTime: 1000 * 60 * 2,
    enabled: !!token, // Only fetch when token exists
  });
};

export const useResetBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      fetcher<void>(`/budgets/reset?month=${month}&year=${year}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", variables.month, variables.year] });
      queryClient.invalidateQueries({ queryKey: ["budget-planning", variables.month, variables.year] });
    },
  });
};

export const useUpsertBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { categoryId: string | null; amount: number; month: number; year: number }) =>
      fetcher<BudgetResponse>(`/budgets`, {
        method: "POST",
        data,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", data.month, data.year] });
      queryClient.invalidateQueries({ queryKey: ["budget-planning", data.month, data.year] });
    },
  });
};
