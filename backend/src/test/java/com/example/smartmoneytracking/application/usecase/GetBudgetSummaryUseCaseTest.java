package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BudgetResponse;
import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.entities.common.MaterialSymbol;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetBudgetSummaryUseCaseTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private WalletRepository walletRepository;
    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private GetBudgetSummaryUseCase getBudgetSummaryUseCase;

    private String userId = "user-123";
    private String walletId = "wallet-456";
    private String categoryId = "cat-789";

    @BeforeEach
    void setUp() {
    }

    @Test
    void execute_WithCategoryBudget_CalculatesCorrectSpending() {
        // Arrange
        Budget budget = Budget.create(userId, categoryId, new BigDecimal("1000"), 4, 2026);
        ReflectionTestUtils.setField(budget, "id", "budget-1");

        Wallet wallet = new Wallet();
        ReflectionTestUtils.setField(wallet, "id", walletId);

        Category category = new Category();
        ReflectionTestUtils.setField(category, "id", categoryId);
        category.updateName("Food");
        category.setIconName(MaterialSymbol.RESTAURANT);

        when(budgetRepository.findByUserIdAndMonthAndYear(userId, 4, 2026))
                .thenReturn(List.of(budget));
        when(walletRepository.findByUserId(userId))
                .thenReturn(List.of(wallet));
        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));
        when(transactionRepository.sumAmountByWalletIdInAndCategoryIdAndTransactionDateBetweenAndType(
                anyList(), eq(categoryId), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("450"));

        // Act
        List<BudgetResponse> result = getBudgetSummaryUseCase.execute(userId, 4, 2026);

        // Assert
        assertEquals(1, result.size());
        BudgetResponse response = result.get(0);
        assertEquals(new BigDecimal("1000"), response.getLimitAmount());
        assertEquals(new BigDecimal("450"), response.getCurrentSpending());
        assertEquals(45.0, response.getPercentageUsed());
        assertEquals("Food", response.getCategoryName());
        assertEquals(MaterialSymbol.RESTAURANT, response.getIconName());
    }

    @Test
    void execute_WithTotalBudget_SumsAllExpenses() {
        // Arrange
        Budget budget = Budget.create(userId, null, new BigDecimal("5000"), 4, 2026);
        ReflectionTestUtils.setField(budget, "id", "budget-total");

        Wallet wallet = new Wallet();
        ReflectionTestUtils.setField(wallet, "id", walletId);

        when(budgetRepository.findByUserIdAndMonthAndYear(userId, 4, 2026))
                .thenReturn(List.of(budget));
        when(walletRepository.findByUserId(userId))
                .thenReturn(List.of(wallet));
        when(transactionRepository.sumAmountByWalletIdInAndTransactionDateBetweenAndType(
                anyList(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("1250"));

        // Act
        List<BudgetResponse> result = getBudgetSummaryUseCase.execute(userId, 4, 2026);

        // Assert
        assertEquals(1, result.size());
        BudgetResponse response = result.get(0);
        assertEquals(new BigDecimal("5000"), response.getLimitAmount());
        assertEquals(new BigDecimal("1250"), response.getCurrentSpending());
        assertEquals(25.0, response.getPercentageUsed());
        assertEquals("Total Budget", response.getCategoryName());
        assertEquals(MaterialSymbol.LIST, response.getIconName());
    }
}
