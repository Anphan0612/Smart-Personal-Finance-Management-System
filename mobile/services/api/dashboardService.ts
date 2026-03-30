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
  categoryId: string;
  description: string;
  transactionDate: string;
  type: string;
}

export type Period = 'current_month' | '3_months'; // "month" | "week" as logically discussed in our MVP

// Use loopback ip for Android Emulator (10.0.2.2) to reach localhost:8080 of the host machine
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api/v1';

export const dashboardService = {
  async getDashboardData(period: Period) {
    try {
      // Dùng default wallet id tạm thời cho MVP, lý tưởng là từ user context
      const defaultWalletId = 'w1';
      
      const response = await fetch(`${API_URL}/dashboard/summary?walletId=${defaultWalletId}&timeRange=${period}`);
      
      if (!response.ok) {
        throw new Error('Không thể kết nối Backend để lấy số liệu thống kê.');
      }
      
      const data = await response.json();
      return {
        summary: data.summary,
        monthlyTrend: data.monthlyTrend,
        categoryBreakdown: data.categoryBreakdown,
        transactions: data.transactions, // recent transactions
      };
    } catch (error) {
      console.warn('Lỗi fetch dữ liệu thực:', error);
      throw error;
    }
  },
};