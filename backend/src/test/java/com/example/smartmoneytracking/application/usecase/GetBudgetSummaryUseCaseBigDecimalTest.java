package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BudgetResponse;
import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
import com.example.smartmoneytracking.domain.repositories.BudgetRepository;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;

import static com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType.EXPENSE;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetBudgetSummaryUseCaseBigDecimalTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private GetBudgetSummaryUseCase useCase;

    @Test
    void shouldKeepRemainingAmountPrecisionForDecimalBudgets() {
        String userId = "user-precision";
        Budget budget = Budget.create(userId, null, new BigDecimal("100.00"), 4, 2026);
        ReflectionTestUtils.setField(budget, "id", "budget-precision");

        Wallet wallet = Wallet.create(userId, "wallet", new Currency("VND", "₫"), WalletType.CASH, BigDecimal.ZERO);
        ReflectionTestUtils.setField(wallet, "id", "wallet-1");

        when(budgetRepository.findByUserIdAndMonthAndYear(userId, 4, 2026)).thenReturn(List.of(budget));
        when(walletRepository.findByUserId(userId)).thenReturn(List.of(wallet));
        when(transactionRepository.sumAmountByWalletIdInAndTransactionDateBetweenAndType(anyList(), any(), any(), eq(EXPENSE)))
                .thenReturn(new BigDecimal("33.33"));

        List<BudgetResponse> responses = useCase.execute(userId, 4, 2026);

        assertEquals(1, responses.size());
        BudgetResponse result = responses.get(0);
        assertEquals(new BigDecimal("66.67"), result.getRemainingAmount());
        assertEquals(new BigDecimal("33.33"), result.getCurrentSpending());
    }
}
