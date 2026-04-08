/**
 * Trình khớp chính xác cấu trúc ApiResponse<T> từ Backend Spring Boot.
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errorCode?: string;
  traceId?: string;
  path?: string;
  suggestion?: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  name: string;
}

export interface DashboardSummary {
  income: number;
  expenses: number;
  balance: number;
  netFlow?: number;
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

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface TransactionResponse {
  id: string;
  walletId: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  type: TransactionType;
  transactionDate: string;
  createdAt: string;
}

export type WalletType = "CASH" | "BANK" | "EWALLET" | "INVESTMENT";

export interface WalletResponse {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currencyCode: string;
  currencySymbol: string;
  type: WalletType;
  createdAt: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  monthlyTrend: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: TransactionResponse[];
}

export type ThresholdStatus = "COMFORT" | "PACING" | "DANGER" | "OVERBUDGET";

export interface BudgetResponse {
  id: string;
  categoryId: string | null;
  categoryName: string;
  iconName: string | null;
  limitAmount: number;
  currentSpending: number;
  percentageUsed: number;
  thresholdStatus: ThresholdStatus;
  remainingAmount: number;
  month: number;
  year: number;
}

export interface BudgetPlanningResponse {
  targetSpending: number;
  totalAllocated: number;
  remainingAmount: number;
  month: number;
  year: number;
}

/**
 * Các lỗi nghiệp vụ phổ biến từ BE
 */
export enum AppErrorCode {
  UNAUTHORIZED = "AUTH_001",
  INSUFFICIENT_FUNDS = "WAL_002",
  TRANSACTION_NOT_FOUND = "TXN_001",
  AI_PROCESSING_ERROR = "AI_001",
}
