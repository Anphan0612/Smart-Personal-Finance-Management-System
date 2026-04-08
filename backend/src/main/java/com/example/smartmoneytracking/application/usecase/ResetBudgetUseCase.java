package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResetBudgetUseCase {

    private final BudgetRepository budgetRepository;

    @Transactional
    public void execute(String userId, int month, int year) {
        budgetRepository.deleteByUserIdAndMonthAndYear(userId, month, year);
    }
}
