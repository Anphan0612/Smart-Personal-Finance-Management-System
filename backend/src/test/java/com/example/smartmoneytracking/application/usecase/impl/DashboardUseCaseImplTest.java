package com.example.smartmoneytracking.application.usecase.impl;

import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardResponseDTO;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.application.service.common.DateUtils;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardUseCaseImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private DashboardUseCaseImpl dashboardUseCase;

    @Test
    void getDashboardSummary_shouldCalculateCorrectSavingsRate() {
        String walletId = "wallet-123";
        OffsetDateTime now = DateUtils.nowUtc();
        
        // Income = 1000, Expenses = 200 -> Savings = 800 -> Rate = 80%
        Transaction income = Transaction.create(walletId, "cat-1", new BigDecimal("1000"), TransactionType.INCOME, "Job", now);
        Transaction expense = Transaction.create(walletId, "cat-2", new BigDecimal("200"), TransactionType.EXPENSE, "Food", now);
        
        when(transactionRepository.findByWalletIdAndTransactionDateBetween(eq(walletId), any(), any()))
                .thenReturn(List.of(income, expense));
        
        when(walletRepository.findById(walletId))
                .thenReturn(Optional.of(new Wallet())); // Balance doesn't matter for the new logic anymore

        DashboardResponseDTO result = dashboardUseCase.getDashboardSummary(walletId, "current_month");

        assertThat(result.getSummary().getIncome()).isEqualByComparingTo("1000");
        assertThat(result.getSummary().getExpenses()).isEqualByComparingTo("200");
        assertThat(result.getSummary().getSavingsRate()).isEqualTo(80.0);
    }
}
