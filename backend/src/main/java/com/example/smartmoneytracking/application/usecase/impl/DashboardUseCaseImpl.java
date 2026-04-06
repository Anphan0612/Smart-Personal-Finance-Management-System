package com.example.smartmoneytracking.application.usecase.impl;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.dashboard.response.CategoryBreakdownDTO;
import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardResponseDTO;
import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardSummaryDTO;
import com.example.smartmoneytracking.application.dto.dashboard.response.MonthlyTrendDTO;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.application.usecase.DashboardUseCase;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
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
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;

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

        BigDecimal walletBalance = walletRepository.findById(walletId)
                .map(com.example.smartmoneytracking.domain.entities.wallet.Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        
        double savingsRate = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savings = income.subtract(expenses);
            savingsRate = savings.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        BigDecimal netFlow = income.subtract(expenses);

        DashboardSummaryDTO summary = DashboardSummaryDTO.builder()
                .income(income)
                .expenses(expenses)
                .balance(walletBalance)
                .netFlow(netFlow)
                .savingsRate(savingsRate)
                .build();

        // 2. Calculate Monthly Trend
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        Map<String, MonthlyTrendDTO> trendMap = new LinkedHashMap<>();
        
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

        // 3. Category Breakdown (Optimized Batch Fetching)
        Map<String, BigDecimal> categorySums = transactions.stream()
                .filter(Transaction::isExpense)
                .collect(Collectors.groupingBy(
                        t -> t.getCategoryId() == null ? "null" : t.getCategoryId(),
                        Collectors.mapping(Transaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        Set<String> catIds = categorySums.keySet().stream()
                .filter(id -> !"null".equals(id))
                .collect(Collectors.toSet());
        
        Map<String, String> catIdToNameMap = new HashMap<>();
        if (!catIds.isEmpty()) {
            categoryRepository.findAllById(catIds).forEach(cat -> catIdToNameMap.put(cat.getId(), cat.getName()));
        }

        List<CategoryBreakdownDTO> categoryBreakdown = categorySums.entrySet().stream()
            .map(entry -> {
                String catId = entry.getKey();
                String catName = "null".equals(catId) ? "Other" : catIdToNameMap.getOrDefault(catId, "Other");
                return CategoryBreakdownDTO.builder()
                        .category(catName)
                        .amount(entry.getValue())
                        .color(getColorForCategory("null".equals(catId) ? null : catId))
                        .build();
            })
            .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
            .collect(Collectors.toList());

        // 4. Recent Transactions (Using Optimized Limited Fetching)
        List<Transaction> recentTransactionsEntities = transactionRepository.findTop5ByWalletIdOrderByTransactionDateDesc(walletId);

        List<TransactionResponse> recentTransactions = transactionMapper.toResponseList(recentTransactionsEntities);

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
        return now.withDayOfMonth(1).withHour(0).withMinute(0);
    }

    private String getColorForCategory(String categoryId) {
        if (categoryId == null) return "#9ca3af";
        String[] colors = {"#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"};
        return colors[Math.abs(categoryId.hashCode()) % colors.length];
    }
}
