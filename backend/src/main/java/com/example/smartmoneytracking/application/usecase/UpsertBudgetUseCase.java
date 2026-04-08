package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UpsertBudgetUseCase {

    private final BudgetRepository budgetRepository;

    @Transactional
    public Budget execute(String userId, String categoryId, BigDecimal amount, int month, int year) {
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year);

        if (existingBudget.isPresent()) {
            Budget budget = existingBudget.get();
            budget.setAmount(amount);
            return budgetRepository.save(budget);
        } else {
            Budget budget = Budget.create(userId, categoryId, amount, month, year);
            return budgetRepository.save(budget);
        }
    }
}
