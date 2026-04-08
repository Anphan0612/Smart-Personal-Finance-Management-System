package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BudgetPlanningResponse;
import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GetBudgetPlanningUseCase {

    private final BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public BudgetPlanningResponse execute(String userId, int month, int year) {
        Optional<Budget> targetBudget = budgetRepository.findByUserIdAndMonthAndYearAndCategoryIdIsNull(userId, month, year);
        List<Budget> categoryBudgets = budgetRepository.findByUserIdAndMonthAndYearAndCategoryIdIsNotNull(userId, month, year);

        BigDecimal targetAmount = targetBudget.map(Budget::getAmount).orElse(BigDecimal.ZERO);
        BigDecimal totalAllocated = categoryBudgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = targetAmount.subtract(totalAllocated);

        return BudgetPlanningResponse.builder()
                .targetSpending(targetAmount)
                .totalAllocated(totalAllocated)
                .remainingAmount(remaining)
                .month(month)
                .year(year)
                .build();
    }
}
