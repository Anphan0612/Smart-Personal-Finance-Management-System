import { Transaction, Budget, UserProfile, DashboardSummary } from "../types";

export const MOCK_USER: UserProfile = {
  id: "u123",
  email: "an.phan@atelier.finance",
  fullName: "An Phan",
  currency: "USD",
  locale: "en-US",
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    amount: 1250.00,
    type: "EXPENSE",
    categoryId: "c1",
    categoryName: "Housing",
    description: "Monthly Rent - April",
    transactionDate: new Date(2026, 3, 1).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    amount: 45.50,
    type: "EXPENSE",
    categoryId: "c2",
    categoryName: "Food & Drink",
    description: "Starbucks Coffee & Snacks",
    transactionDate: new Date(2026, 3, 2, 10, 30).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "t3",
    amount: 5200.00,
    type: "INCOME",
    categoryId: "c3",
    categoryName: "Salary",
    description: "Monthly Salary Deposit",
    transactionDate: new Date(2026, 2, 31).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "t4",
    amount: 85.20,
    type: "EXPENSE",
    categoryId: "c4",
    categoryName: "Transport",
    description: "Uber rides",
    transactionDate: new Date(2026, 3, 2, 18, 45).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "t5",
    amount: 120.00,
    type: "EXPENSE",
    categoryId: "c5",
    categoryName: "Entertainment",
    description: "Netflix & Spotify Subscriptions",
    transactionDate: new Date(2026, 3, 3).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "b1",
    category: "Food & Drink",
    limit: 600,
    spent: 420.50,
    period: "monthly",
  },
  {
    id: "b2",
    category: "Transport",
    limit: 200,
    spent: 85.20,
    period: "monthly",
  },
  {
    id: "b3",
    category: "Entertainment",
    limit: 150,
    spent: 120.00,
    period: "monthly",
  },
];

export const MOCK_DASHBOARD: DashboardSummary = {
  totalBalance: 12450.75,
  totalIncome: 5200.00,
  totalExpense: 1520.70,
  recentTransactions: MOCK_TRANSACTIONS.slice(0, 5),
  budgetOverview: MOCK_BUDGETS,
};

export const MOCK_AI_MESSAGES = [
  {
    id: "m1",
    role: "assistant",
    content: "Chào An! Tôi là Trợ lý Tài chính Atelier. Hôm nay bạn đã chi tiêu $45.50 cho Ăn uống. Bạn vẫn còn $179.50 trong ngân sách thực phẩm tháng này. Bạn có muốn xem chi tiết biểu đồ không?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "m2",
    role: "user",
    content: "Tình hình tài chính của tôi tháng này thế nào?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "m3",
    role: "assistant",
    content: "Tháng này bạn đang quản lý khá tốt! Thu nhập đạt $5,200 và chi tiêu mới chỉ chiếm 29% tổng ngân sách. Đặc biệt, chi phí đi lại (Transport) đang thấp hơn 40% so với tháng trước.",
    timestamp: new Date().toISOString(),
  },
];
