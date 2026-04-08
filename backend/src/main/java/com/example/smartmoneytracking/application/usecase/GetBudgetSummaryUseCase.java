package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BudgetResponse;
import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetBudgetSummaryUseCase {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<BudgetResponse> execute(String userId, int month, int year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        List<String> walletIds = walletRepository.findByUserId(userId).stream()
                .map(Wallet::getId)
                .collect(Collectors.toList());

        if (walletIds.isEmpty()) {
            return budgets.stream().map(this::mapToEmptyResponse).collect(Collectors.toList());
        }

        LocalDateTime start = YearMonth.of(year, month).atDay(1).atStartOfDay();
        LocalDateTime end = YearMonth.of(year, month).atEndOfMonth().atTime(LocalTime.MAX);

        return budgets.stream()
                .map(budget -> calculateProgress(budget, walletIds, start, end))
                .collect(Collectors.toList());
    }

    private BudgetResponse calculateProgress(Budget budget, List<String> walletIds, LocalDateTime start, LocalDateTime end) {
        BigDecimal spending;
        String categoryName = "Total Budget";
        com.example.smartmoneytracking.domain.entities.common.MaterialSymbol iconName = com.example.smartmoneytracking.domain.entities.common.MaterialSymbol.LIST;

        if (budget.getCategoryId() == null) {
            spending = transactionRepository.sumAmountByWalletIdInAndTransactionDateBetweenAndType(
                    walletIds, start, end, TransactionType.EXPENSE);
        } else {
            spending = transactionRepository.sumAmountByWalletIdInAndCategoryIdAndTransactionDateBetweenAndType(
                    walletIds, budget.getCategoryId(), start, end, TransactionType.EXPENSE);
            
            Optional<Category> category = categoryRepository.findById(budget.getCategoryId());
            if (category.isPresent()) {
                categoryName = category.get().getName();
                iconName = category.get().getIconName();
            }
        }

        BigDecimal currentSpending = spending != null ? spending : BigDecimal.ZERO;
        double percentage = budget.getAmount().compareTo(BigDecimal.ZERO) > 0 
                ? currentSpending.doubleValue() / budget.getAmount().doubleValue() * 100 
                : 0;

        BigDecimal remainingAmount = budget.getAmount().subtract(currentSpending);
        String thresholdStatus = "COMFORT";
        if (percentage >= 100) {
            thresholdStatus = "OVERBUDGET";
        } else if (percentage >= 80) {
            thresholdStatus = "DANGER";
        } else if (percentage >= 50) {
            thresholdStatus = "PACING";
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .iconName(iconName)
                .limitAmount(budget.getAmount())
                .currentSpending(currentSpending)
                .percentageUsed(percentage)
                .thresholdStatus(thresholdStatus)
                .remainingAmount(remainingAmount)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }

    private BudgetResponse mapToEmptyResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .limitAmount(budget.getAmount())
                .currentSpending(BigDecimal.ZERO)
                .percentageUsed(0)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}
