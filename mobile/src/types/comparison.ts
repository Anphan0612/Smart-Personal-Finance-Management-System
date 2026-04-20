export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: Record<string, number>;
}

export interface TransactionComparisonResponse {
  currentWeek: PeriodSummary;
  lastWeek: PeriodSummary;
  currentMonth: PeriodSummary;
  lastMonth: PeriodSummary;
}
