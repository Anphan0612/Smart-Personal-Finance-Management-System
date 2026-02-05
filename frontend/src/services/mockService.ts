import { mockTransactions, type Transaction, type DashboardData, mockChartData } from './mockData';

// Constants
const LATENCY_MS = 800; // Simulate network delay
const STORAGE_KEY = 'smart_money_transactions';

// Initialize data from local storage or fall back to mock data
const getStoredTransactions = (): Transaction[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize with mock data if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTransactions));
    return mockTransactions;
};

// Mock Service
export const mockService = {
    getTransactions: async (): Promise<Transaction[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getStoredTransactions();
                resolve(transactions);
            }, LATENCY_MS);
        });
    },

    addTransaction: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getStoredTransactions();
                const newTransaction: Transaction = {
                    ...data,
                    id: Math.random().toString(36).substr(2, 9),
                };
                const updated = [newTransaction, ...transactions];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                resolve(newTransaction);
            }, LATENCY_MS);
        });
    },

    deleteTransaction: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getStoredTransactions();
                const updated = transactions.filter(t => t.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                resolve();
            }, LATENCY_MS);
        });
    },

    getDashboardData: async (): Promise<DashboardData> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getStoredTransactions();
                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                resolve({
                    totalBalance: income - expense,
                    totalIncome: income,
                    totalExpense: expense,
                    recentTransactions: transactions.slice(0, 5),
                    monthlyStats: mockChartData, // Using hardcoded chart data for now
                    insights: [
                        "🤖 AI Tip: You spent 20% more on Coffee this month compared to average.",
                        "✅ Good Job: You saved 15% of your income this month.",
                    ]
                });
            }, LATENCY_MS);
        });
    }
};
