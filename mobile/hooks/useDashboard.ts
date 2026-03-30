import {useCallback, useEffect, useState} from 'react';
import {
    CategoryBreakdown,
    dashboardService,
    DashboardSummary,
    MonthlyTrend,
    TimeRange,
    Transaction
} from '../services/api/dashboardService';
import {dashboardCache} from '../services/cache/dashboardCache';

interface DashboardData {
  summary: DashboardSummary | null;
  monthlyTrend: MonthlyTrend[] | null;
  categoryBreakdown: CategoryBreakdown[] | null;
  transactions: Transaction[] | null;
}

interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
  timeRange: TimeRange;
}

export const useDashboard = (initialTimeRange: TimeRange = 'current_month') => {
  const [state, setState] = useState<DashboardState>({
    summary: null,
    monthlyTrend: null,
    categoryBreakdown: null,
    transactions: null,
    loading: true,
    error: null,
    timeRange: initialTimeRange,
  });

  const fetchDashboardData = useCallback(async (timeRange: TimeRange, useCache: boolean = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let data: DashboardData;

      if (useCache) {
        // Try to get from cache first
        const [cachedSummary, cachedTrend, cachedBreakdown, cachedTransactions] = await Promise.all([
          dashboardCache.getSummary(timeRange),
          dashboardCache.getMonthlyTrend(timeRange),
          dashboardCache.getCategoryBreakdown(timeRange),
          dashboardCache.getTransactions(),
        ]);

        if (cachedSummary && cachedTrend && cachedBreakdown && cachedTransactions) {
          data = {
            summary: cachedSummary as DashboardSummary,
            monthlyTrend: cachedTrend as MonthlyTrend[],
            categoryBreakdown: cachedBreakdown as CategoryBreakdown[],
            transactions: cachedTransactions as Transaction[],
          };
        } else {
          // Fetch from API
          data = await dashboardService.getDashboardData(timeRange);

          // Cache the results
          await Promise.all([
            dashboardCache.setSummary(data.summary, timeRange),
            dashboardCache.setMonthlyTrend(data.monthlyTrend, timeRange),
            dashboardCache.setCategoryBreakdown(data.categoryBreakdown, timeRange),
            dashboardCache.setTransactions(data.transactions),
          ]);
        }
      } else {
        // Force refresh from API
        data = await dashboardService.getDashboardData(timeRange);

        // Update cache
        await Promise.all([
          dashboardCache.setSummary(data.summary, timeRange),
          dashboardCache.setMonthlyTrend(data.monthlyTrend, timeRange),
          dashboardCache.setCategoryBreakdown(data.categoryBreakdown, timeRange),
          dashboardCache.setTransactions(data.transactions),
        ]);
      }

      setState(prev => ({
        ...prev,
        ...data,
        loading: false,
        timeRange,
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  }, []);

  const refetch = useCallback(() => {
    fetchDashboardData(state.timeRange, false);
  }, [state.timeRange, fetchDashboardData]);

  const setTimeRange = useCallback((timeRange: TimeRange) => {
    if (timeRange !== state.timeRange) {
      fetchDashboardData(timeRange, true);
    }
  }, [state.timeRange, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData(initialTimeRange, true);
  }, [fetchDashboardData, initialTimeRange]);

  return {
    ...state,
    refetch,
    setTimeRange,
  };
};