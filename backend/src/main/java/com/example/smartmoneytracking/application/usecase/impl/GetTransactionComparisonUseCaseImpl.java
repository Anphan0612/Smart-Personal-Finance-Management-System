package com.example.smartmoneytracking.application.usecase.impl;

import com.example.smartmoneytracking.application.dto.TransactionComparisonResponse;
import com.example.smartmoneytracking.application.usecase.GetTransactionComparisonUseCase;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GetTransactionComparisonUseCaseImpl implements GetTransactionComparisonUseCase {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public TransactionComparisonResponse execute(String walletId, String userId) {
        LocalDateTime now = LocalDateTime.now();

        // Weekly Periods
        LocalDateTime w0Start = now.minusDays(6).with(LocalTime.MIN);
        LocalDateTime w1Start = now.minusDays(13).with(LocalTime.MIN);
        LocalDateTime w1End = now.minusDays(7).with(LocalTime.MAX);

        // Monthly Periods
        LocalDateTime m0Start = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        LocalDateTime m1Start = now.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        LocalDateTime m1End = now.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);

        // Fetch Transactions
        List<Transaction> w0Transactions = transactionRepository.findByWalletIdAndTransactionDateBetween(walletId, w0Start, now);
        List<Transaction> w1Transactions = transactionRepository.findByWalletIdAndTransactionDateBetween(walletId, w1Start, w1End);
        List<Transaction> m0Transactions = transactionRepository.findByWalletIdAndTransactionDateBetween(walletId, m0Start, now);
        List<Transaction> m1Transactions = transactionRepository.findByWalletIdAndTransactionDateBetween(walletId, m1Start, m1End);

        // Category Map for names
        Set<String> allCategoryIds = Stream.of(w0Transactions, w1Transactions, m0Transactions, m1Transactions)
                .flatMap(List::stream)
                .map(Transaction::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        Map<String, String> categoryIdToName = new HashMap<>();
        if (!allCategoryIds.isEmpty()) {
            categoryRepository.findAllById(allCategoryIds).forEach(cat -> categoryIdToName.put(cat.getId(), cat.getName()));
        }

        return TransactionComparisonResponse.builder()
                .currentWeek(calculateSummary(w0Transactions, categoryIdToName))
                .lastWeek(calculateSummary(w1Transactions, categoryIdToName))
                .currentMonth(calculateSummary(m0Transactions, categoryIdToName))
                .lastMonth(calculateSummary(m1Transactions, categoryIdToName))
                .build();
    }

    private TransactionComparisonResponse.PeriodSummary calculateSummary(List<Transaction> transactions, Map<String, String> categoryIdToName) {
        BigDecimal totalIncome = transactions.stream()
                .filter(Transaction::isIncome)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(Transaction::isExpense)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> expenseByCategory = transactions.stream()
                .filter(Transaction::isExpense)
                .collect(Collectors.groupingBy(
                        t -> categoryIdToName.getOrDefault(t.getCategoryId(), "Khác"),
                        Collectors.mapping(Transaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return TransactionComparisonResponse.PeriodSummary.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .expenseByCategory(expenseByCategory)
                .build();
    }
}
