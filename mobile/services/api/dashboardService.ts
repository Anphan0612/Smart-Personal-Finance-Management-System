
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
  category: string;
  amount: number;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export type TimeRange = 'current_month' | '3_months';

// Mock data - replace with actual API calls
const mockSummary: DashboardSummary = {
  income: 15000000,
  expenses: 8500000,
  balance: 6500000,
  savingsRate: 43.3,
};

const mockMonthlyTrend: MonthlyTrend[] = [
  { month: 'Jan', income: 12000000, expenses: 8000000 },
  { month: 'Feb', income: 14000000, expenses: 9000000 },
  { month: 'Mar', income: 15000000, expenses: 8500000 },
];

const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: 'Food', amount: 2500000, color: '#ef4444' },
  { category: 'Transport', amount: 1800000, color: '#3b82f6' },
  { category: 'Shopping', amount: 1500000, color: '#8b5cf6' },
  { category: 'Entertainment', amount: 1200000, color: '#f59e0b' },
  { category: 'Bills', amount: 1500000, color: '#10b981' },
];

const mockTransactions: Transaction[] = [
  { id: '1', amount: -500000, category: 'Food', description: 'Lunch at restaurant', date: '2024-01-15', type: 'expense' },
  { id: '2', amount: 5000000, category: 'Salary', description: 'Monthly salary', date: '2024-01-01', type: 'income' },
  { id: '3', amount: -200000, category: 'Transport', description: 'Taxi fare', date: '2024-01-14', type: 'expense' },
  { id: '4', amount: -1500000, category: 'Shopping', description: 'New clothes', date: '2024-01-13', type: 'expense' },
  { id: '5', amount: -300000, category: 'Entertainment', description: 'Movie tickets', date: '2024-01-12', type: 'expense' },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  async getSummary(timeRange: TimeRange): Promise<DashboardSummary> {
    await delay(500); // Simulate network delay
    return mockSummary;
  },

  async getMonthlyTrend(timeRange: TimeRange): Promise<MonthlyTrend[]> {
    await delay(300);
    return mockMonthlyTrend;
  },

  async getCategoryBreakdown(timeRange: TimeRange): Promise<CategoryBreakdown[]> {
    await delay(400);
    return mockCategoryBreakdown;
  },

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    await delay(200);
    return mockTransactions.slice(0, limit);
  },

  // Combined method for parallel fetching
  async getDashboardData(timeRange: TimeRange) {
    const [summary, monthlyTrend, categoryBreakdown, transactions] = await Promise.all([
      this.getSummary(timeRange),
      this.getMonthlyTrend(timeRange),
      this.getCategoryBreakdown(timeRange),
      this.getRecentTransactions(5),
    ]);

    return {
      summary,
      monthlyTrend,
      categoryBreakdown,
      transactions,
    };
  },
};