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
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import com.example.smartmoneytracking.application.service.common.DateUtils;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardUseCaseImpl implements com.example.smartmoneytracking.application.usecase.DashboardUseCase {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;

    @Override
    public DashboardResponseDTO getDashboardSummary(String walletId, String timeRange, String startDateStr, String endDateStr, String userId) {
        // Verify ownership first
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found or unauthorized"));

        ZonedDateTime localNow = DateUtils.nowInUserTz();
        ZonedDateTime localStart;
        ZonedDateTime localEnd = localNow;

        if (startDateStr != null && !startDateStr.isEmpty()) {
            localStart = ZonedDateTime.parse(startDateStr).withZoneSameInstant(localNow.getZone());
            if (endDateStr != null && !endDateStr.isEmpty()) {
                localEnd = ZonedDateTime.parse(endDateStr).withZoneSameInstant(localNow.getZone());
            }
        } else {
            localStart = calculateStartDate(timeRange, localNow);
            if ("current_week".equals(timeRange) || "current_month".equals(timeRange) || "current_year".equals(timeRange)) {
                // If it's a "current_*" preset, we still want to query up to now
                localEnd = localNow;
            } else if ("last_month".equals(timeRange)) {
                localEnd = localStart.plusMonths(1).minusSeconds(1);
            }
        }
        
        OffsetDateTime startUtc = DateUtils.toUtc(localStart);
        OffsetDateTime endUtc = DateUtils.toUtc(localEnd);
 
        List<Transaction> transactions = transactionRepository.findByWalletIdAndTransactionDateBetween(walletId, startUtc, endUtc);
 
        // 1. Calculate Summary
        BigDecimal income = transactions.stream()
                .filter(Transaction::isIncome)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
 
        BigDecimal expenses = transactions.stream()
                .filter(Transaction::isExpense)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
 
        BigDecimal walletBalance = wallet.getBalance();
        
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

        // 2. Calculate Trend
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(localStart, localEnd);
        boolean isDaily = daysBetween <= 31;
        
        DateTimeFormatter formatter = isDaily ? DateTimeFormatter.ofPattern("dd/MM") : DateTimeFormatter.ofPattern("MM/yyyy");
        Map<String, MonthlyTrendDTO> trendMap = new LinkedHashMap<>();
        
        ZonedDateTime tempDate = localStart;
        while (!tempDate.isAfter(localEnd)) {
            String key = tempDate.format(formatter);
            trendMap.putIfAbsent(key, new MonthlyTrendDTO(key, BigDecimal.ZERO, BigDecimal.ZERO));
            tempDate = isDaily ? tempDate.plusDays(1) : tempDate.plusMonths(1);
        }

        for (Transaction t : transactions) {
            // Convert UTC storage to user local time for correct grouping
            OffsetDateTime localDate = t.getTransactionDate()
                    .withOffsetSameInstant(java.time.ZoneId.of(com.example.smartmoneytracking.application.service.common.TimezoneContextHolder.getTimezone()).getRules().getOffset(t.getTransactionDate().toInstant()));
            
            String label = localDate.format(formatter);
            MonthlyTrendDTO trend = trendMap.getOrDefault(label, new MonthlyTrendDTO(label, BigDecimal.ZERO, BigDecimal.ZERO));
            if (t.isIncome()) {
                trend.setIncome(trend.getIncome().add(t.getAmount()));
            } else {
                trend.setExpenses(trend.getExpenses().add(t.getAmount()));
            }
            trendMap.put(label, trend);
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

    private ZonedDateTime calculateStartDate(String timeRange, ZonedDateTime now) {
        if ("current_week".equals(timeRange)) {
            int dayOfWeek = now.getDayOfWeek().getValue();
            return now.minusDays(dayOfWeek - 1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        } else if ("last_month".equals(timeRange)) {
            return now.minusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        } else if ("3_months".equals(timeRange)) {
            return now.minusMonths(3).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        } else if ("current_year".equals(timeRange)) {
            return now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        }
        // Default to current_month
        return now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    private String getColorForCategory(String categoryId) {
        if (categoryId == null) return "#9ca3af";
        String[] colors = {"#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"};
        return colors[Math.abs(categoryId.hashCode()) % colors.length];
    }
}
