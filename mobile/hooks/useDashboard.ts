import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dashboardService, Period } from '../services/api/dashboardService';

export const useDashboardSummary = (initialPeriod: Period = 'current_month') => {
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', period], // QueryKey gắn chặt với period để cache chuẩn
    queryFn: () => dashboardService.getDashboardData(period),
    staleTime: 1000 * 60 * 5, // 5 phút cache, giảm refetch dư thừa theo AC
  });

  return {
    summary: data?.summary || null,
    monthlyTrend: data?.monthlyTrend || null,
    categoryBreakdown: data?.categoryBreakdown || null,
    transactions: data?.transactions || null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    period,
    setPeriod,
    refetch,
  };
};