export interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category: string;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: "weekly" | "monthly" | "yearly";
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  locale: string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
  budgetOverview: Budget[];
}

export type ElevationLevel = "lowest" | "low" | "high";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "caption"
  | "label";

export type ButtonVariant = "primary" | "secondary" | "outline" | "link";
