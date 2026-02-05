
export interface Transaction {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
}

export interface ChartData {
    name: string; // e.g., "Jan", "Feb"
    income: number;
    expense: number;
}

export interface DashboardData {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    recentTransactions: Transaction[];
    monthlyStats: ChartData[];
    insights: string[];
}

export const mockTransactions: Transaction[] = [
    { id: '1', date: '2023-10-25', category: 'Food', description: 'Lunch at McD', amount: 15.50, type: 'expense' },
    { id: '2', date: '2023-10-26', category: 'Transport', description: 'Uber to work', amount: 25.00, type: 'expense' },
    { id: '3', date: '2023-10-27', category: 'Salary', description: 'October Salary', amount: 3000.00, type: 'income' },
    { id: '4', date: '2023-10-28', category: 'Entertainment', description: 'Cinema tickets', amount: 40.00, type: 'expense' },
    { id: '5', date: '2023-10-29', category: 'Grocery', description: 'Weekly groceries', amount: 120.00, type: 'expense' },
];

export const mockChartData: ChartData[] = [
    { name: 'Jul', income: 2800, expense: 2200 },
    { name: 'Aug', income: 2900, expense: 2100 },
    { name: 'Sep', income: 3000, expense: 2400 },
    { name: 'Oct', income: 3200, expense: 1800 }, // Current month (simulated)
];

export const getDashboardData = async (): Promise<DashboardData> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        totalBalance: 12500.00,
        totalIncome: 3200.00,
        totalExpense: 1800.00,
        recentTransactions: mockTransactions,
        monthlyStats: mockChartData,
        insights: [
            "Spending Alert: You spent 20% more on Coffee this month compared to average.",
            "Good Job: You saved 15% of your income this month.",
        ]
    };
};

export const getTransactions = async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;
};
