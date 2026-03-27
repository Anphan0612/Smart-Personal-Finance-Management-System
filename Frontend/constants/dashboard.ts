import { CategoryBreakdown, DashboardSummary, MonthlyTrend, TimeRange, Transaction } from '../services/api/dashboardService';

// Re-export types for convenience
export type { CategoryBreakdown, DashboardSummary, MonthlyTrend, TimeRange, Transaction };

// Dashboard configuration
export const DASHBOARD_CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  RECENT_TRANSACTIONS_LIMIT: 5,
  MONTHLY_TREND_MONTHS: 3,
} as const;

// Default values for loading states
export const DEFAULT_DASHBOARD_DATA = {
  summary: {
    income: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0,
  },
  monthlyTrend: [],
  categoryBreakdown: [],
  transactions: [],
} as const;

// Time range options
export const TIME_RANGE_OPTIONS = [
  { label: 'Current Month', value: 'current_month' as TimeRange },
  { label: 'Last 3 Months', value: '3_months' as TimeRange },
] as const;

// Category colors for charts
export const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Entertainment: '#f59e0b',
  Bills: '#10b981',
  Salary: '#06b6d4',
  Other: '#6b7280',
} as const;

// Chart configuration
export const CHART_CONFIG = {
  barChart: {
    height: 200,
    padding: { top: 20, bottom: 50, left: 50, right: 20 },
    barRatio: 0.8,
  },
  pieChart: {
    height: 200,
    innerRadius: 40,
    padAngle: 0.02,
  },
} as const;