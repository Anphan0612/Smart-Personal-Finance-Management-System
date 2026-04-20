package com.example.smartmoneytracking.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionComparisonResponse {
    private PeriodSummary currentWeek;
    private PeriodSummary lastWeek;
    private PeriodSummary currentMonth;
    private PeriodSummary lastMonth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodSummary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private Map<String, BigDecimal> expenseByCategory;
    }
}
