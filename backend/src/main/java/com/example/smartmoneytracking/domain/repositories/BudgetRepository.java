package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.budget.Budget;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository {
    Budget save(Budget budget);
    Optional<Budget> findById(String id);
    Optional<Budget> findByUserIdAndCategoryIdAndMonthAndYear(String userId, String categoryId, int month, int year);
    List<Budget> findByUserIdAndMonthAndYear(String userId, int month, int year);
    Optional<Budget> findByUserIdAndMonthAndYearAndCategoryIdIsNull(String userId, int month, int year);
    List<Budget> findByUserIdAndMonthAndYearAndCategoryIdIsNotNull(String userId, int month, int year);
    void deleteById(String id);
    void deleteByUserIdAndMonthAndYear(String userId, int month, int year);
}
