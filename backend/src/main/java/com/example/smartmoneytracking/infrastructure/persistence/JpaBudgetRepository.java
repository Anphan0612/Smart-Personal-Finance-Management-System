package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaBudgetRepository extends JpaRepository<Budget, String>, BudgetRepository {
    Optional<Budget> findByUserIdAndCategoryIdAndMonthAndYear(String userId, String categoryId, int month, int year);
    List<Budget> findByUserIdAndMonthAndYear(String userId, int month, int year);
    Optional<Budget> findByUserIdAndMonthAndYearAndCategoryIdIsNull(String userId, int month, int year);
    List<Budget> findByUserIdAndMonthAndYearAndCategoryIdIsNotNull(String userId, int month, int year);
    void deleteByUserIdAndMonthAndYear(String userId, int month, int year);
}
