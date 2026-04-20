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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import com.example.smartmoneytracking.application.service.common.DateUtils;
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

        YearMonth resolvedYm;
        try {
            resolvedYm = YearMonth.of(year, month);
        } catch (java.time.DateTimeException e) {
            resolvedYm = YearMonth.now();
        }

        String userTz = com.example.smartmoneytracking.application.service.common.TimezoneContextHolder.getTimezone();
        ZoneId zoneId = ZoneId.of(userTz);

        ZonedDateTime localStart = resolvedYm.atDay(1).atStartOfDay(zoneId);
        ZonedDateTime localEnd = resolvedYm.atEndOfMonth().atTime(LocalTime.MAX).atZone(zoneId);

        final LocalDateTime startUtc = DateUtils.toUtc(localStart);
        final LocalDateTime endUtc = DateUtils.toUtc(localEnd);

        return budgets.stream()
                .map(budget -> calculateProgress(budget, walletIds, startUtc, endUtc))
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
        BigDecimal limit = budget.getAmount() != null ? budget.getAmount() : BigDecimal.ZERO;
        double percentage = limit.compareTo(BigDecimal.ZERO) > 0 
                ? currentSpending.doubleValue() / limit.doubleValue() * 100 
                : 0;

        BigDecimal remainingAmount = limit.subtract(currentSpending);
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
                .limitAmount(limit)
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
                .categoryName(budget.getCategoryId() == null ? "Total Budget" : "Category Budget")
                .iconName(com.example.smartmoneytracking.domain.entities.common.MaterialSymbol.LIST)
                .limitAmount(budget.getAmount() != null ? budget.getAmount() : BigDecimal.ZERO)
                .currentSpending(BigDecimal.ZERO)
                .percentageUsed(0)
                .thresholdStatus("COMFORT")
                .remainingAmount(budget.getAmount() != null ? budget.getAmount() : BigDecimal.ZERO)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}
