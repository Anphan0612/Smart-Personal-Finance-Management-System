package com.example.smartmoneytracking.application.usecase.impl;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.dashboard.response.CategoryBreakdownDTO;
import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardResponseDTO;
import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardSummaryDTO;
import com.example.smartmoneytracking.application.dto.dashboard.response.MonthlyTrendDTO;
import com.example.smartmoneytracking.application.usecase.DashboardUseCase;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardUseCaseImpl implements DashboardUseCase {

    private final TransactionRepository transactionRepository;

    @Override
    public DashboardResponseDTO getDashboardSummary(String walletId, String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = calculateStartDate(timeRange, now);

        List<Transaction> transactions = transactionRepository.findByWalletIdAndTransactionDateBetween(walletId, startDate, now);

        // 1. Calculate Summary
        BigDecimal income = transactions.stream()
                .filter(Transaction::isIncome)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expenses = transactions.stream()
                .filter(Transaction::isExpense)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = income.subtract(expenses);
        
        double savingsRate = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        DashboardSummaryDTO summary = DashboardSummaryDTO.builder()
                .income(income)
                .expenses(expenses)
                .balance(balance)
                .savingsRate(savingsRate)
                .build();

        // 2. Calculate Monthly Trend
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        Map<String, MonthlyTrendDTO> trendMap = new LinkedHashMap<>(); // To preserve order
        
        // Initialize map with required months
        LocalDateTime tempDate = startDate;
        while (!tempDate.isAfter(now)) {
            trendMap.put(tempDate.format(monthFormatter), new MonthlyTrendDTO(tempDate.format(monthFormatter), BigDecimal.ZERO, BigDecimal.ZERO));
            tempDate = tempDate.plusMonths(1);
        }

        for (Transaction t : transactions) {
            String month = t.getTransactionDate().format(monthFormatter);
            MonthlyTrendDTO trend = trendMap.getOrDefault(month, new MonthlyTrendDTO(month, BigDecimal.ZERO, BigDecimal.ZERO));
            
            if (t.isIncome()) {
                trend.setIncome(trend.getIncome().add(t.getAmount()));
            } else {
                trend.setExpenses(trend.getExpenses().add(t.getAmount()));
            }
            trendMap.put(month, trend);
        }

        // 3. Category Breakdown (Expenses only for simplicity, or both if needed)
        // Group by Category -> Total Amount
        Map<String, BigDecimal> categorySums = transactions.stream()
                .filter(Transaction::isExpense)
                .collect(Collectors.groupingBy(
                        Transaction::getCategoryId,
                        Collectors.mapping(Transaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        List<CategoryBreakdownDTO> categoryBreakdown = categorySums.entrySet().stream()
                .map(entry -> CategoryBreakdownDTO.builder()
                        .category(entry.getKey()) // Need to map to Category Name ideally, but using ID for now
                        .amount(entry.getValue())
                        .color(getColorForCategory(entry.getKey()))
                        .build())
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        // 4. Recent Transactions
        List<TransactionResponse> recentTransactions = transactions.stream()
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .limit(5)
                .map(t -> TransactionResponse.builder()
                        .id(t.getId())
                        .walletId(t.getWalletId())
                        .amount(t.getAmount())
                        .categoryId(t.getCategoryId())
                        .description(t.getDescription())
                        .transactionDate(t.getTransactionDate())
                        .createdAt(t.getCreatedAt())
                        .type(t.getType())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponseDTO.builder()
                .summary(summary)
                .monthlyTrend(new ArrayList<>(trendMap.values()))
                .categoryBreakdown(categoryBreakdown)
                .transactions(recentTransactions)
                .build();
    }

    private LocalDateTime calculateStartDate(String timeRange, LocalDateTime now) {
        if ("3_months".equals(timeRange)) {
            return now.minusMonths(3).withDayOfMonth(1).withHour(0).withMinute(0);
        }
        // Default to current_month
        return now.withDayOfMonth(1).withHour(0).withMinute(0);
    }

    private String getColorForCategory(String categoryId) {
        // Mock color mapping, could be improved by fetching Category entities
        String[] colors = {"#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"};
        return colors[Math.abs(categoryId.hashCode()) % colors.length];
    }
}
