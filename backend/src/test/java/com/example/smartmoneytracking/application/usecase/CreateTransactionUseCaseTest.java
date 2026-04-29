package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionRequest;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.entities.category.valueobject.Type;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateTransactionUseCaseTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private CreateTransactionUseCase useCase;

    private Wallet wallet;
    private Category category;

    @BeforeEach
    void setUp() {
        wallet = Wallet.create(
                "user-1",
                "Main Wallet",
                new Currency("VND", "₫"),
                WalletType.CASH,
                new BigDecimal("1000.10")
        );
        ReflectionTestUtils.setField(wallet, "id", "wallet-1");

        category = Category.create("Food", Type.EXPENSE);
        ReflectionTestUtils.setField(category, "id", "cat-1");
    }

    @Test
    void shouldCreateExpenseTransactionAndWithdrawWithBigDecimalPrecision() {
        TransactionRequest request = TransactionRequest.builder()
                .walletId("wallet-1")
                .categoryId("cat-1")
                .amount(new BigDecimal("0.30"))
                .type(TransactionType.EXPENSE)
                .description("coffee")
                .transactionDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1))
                .build();

        when(walletRepository.findById("wallet-1")).thenReturn(Optional.of(wallet));
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionMapper.toResponse(any(Transaction.class))).thenReturn(
                TransactionResponse.builder().id("tx-1").walletId("wallet-1").amount(new BigDecimal("0.30")).build()
        );

        TransactionResponse response = useCase.execute(request, "user-1");

        assertNotNull(response);
        assertEquals(new BigDecimal("999.80"), wallet.getBalance());

        ArgumentCaptor<Transaction> txCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(txCaptor.capture());
        assertEquals(new BigDecimal("0.30"), txCaptor.getValue().getAmount());
        verify(walletRepository).save(wallet);
    }

    @Test
    void shouldThrowWhenWalletNotFound() {
        TransactionRequest request = TransactionRequest.builder()
                .walletId("missing-wallet")
                .categoryId("cat-1")
                .amount(new BigDecimal("10.00"))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1))
                .build();

        when(walletRepository.findById("missing-wallet")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                useCase.execute(request, "user-1")
        );

        assertEquals("Wallet not found", ex.getMessage());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void shouldThrowUnauthorizedWhenWalletNotOwnedByUser() {
        TransactionRequest request = TransactionRequest.builder()
                .walletId("wallet-1")
                .categoryId("cat-1")
                .amount(new BigDecimal("10.00"))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1))
                .build();

        when(walletRepository.findById("wallet-1")).thenReturn(Optional.of(wallet));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                useCase.execute(request, "another-user")
        );

        assertEquals(ErrorCode.UNAUTHORIZED_ACCESS, ex.getErrorCode());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void shouldThrowValidationWhenCategoryMissingForExpense() {
        TransactionRequest request = TransactionRequest.builder()
                .walletId("wallet-1")
                .amount(new BigDecimal("10.00"))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1))
                .build();

        when(walletRepository.findById("wallet-1")).thenReturn(Optional.of(wallet));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                useCase.execute(request, "user-1")
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
    }
}
