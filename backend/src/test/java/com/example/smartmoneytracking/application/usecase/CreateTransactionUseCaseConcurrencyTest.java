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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateTransactionUseCaseConcurrencyTest {

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

    @Test
    void shouldKeepDeterministicBalanceWhenConcurrentExpenseRequests() throws Exception {
        Wallet wallet = Wallet.create("user-1", "Concurrent Wallet", new Currency("VND", "₫"), WalletType.CASH, new BigDecimal("1000.00"));
        ReflectionTestUtils.setField(wallet, "id", "wallet-concurrent");

        Category category = Category.create("Food", Type.EXPENSE);
        ReflectionTestUtils.setField(category, "id", "cat-concurrent");

        when(walletRepository.findById("wallet-concurrent")).thenReturn(Optional.of(wallet));
        when(categoryRepository.findById("cat-concurrent")).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionMapper.toResponse(any(Transaction.class))).thenReturn(TransactionResponse.builder().id("tx").build());

        int taskCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(8);
        CountDownLatch ready = new CountDownLatch(taskCount);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Void>> futures = new ArrayList<>();

        for (int i = 0; i < taskCount; i++) {
            futures.add(executor.submit(() -> {
                ready.countDown();
                start.await(5, TimeUnit.SECONDS);
                TransactionRequest request = TransactionRequest.builder()
                        .walletId("wallet-concurrent")
                        .categoryId("cat-concurrent")
                        .amount(new BigDecimal("10.00"))
                        .type(TransactionType.EXPENSE)
                        .description("parallel")
                        .transactionDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1))
                        .build();
                useCase.execute(request, "user-1");
                return null;
            }));
        }

        ready.await(5, TimeUnit.SECONDS);
        start.countDown();
        for (Future<Void> future : futures) {
            future.get(5, TimeUnit.SECONDS);
        }
        executor.shutdownNow();

        assertEquals(taskCount, futures.size());
        assertEquals(taskCount, (int) mockingDetails(transactionRepository).getInvocations().stream()
                .filter(invocation -> "save".equals(invocation.getMethod().getName()))
                .count());
        assertTrue(wallet.getBalance().compareTo(new BigDecimal("800.00")) >= 0);
        assertTrue(wallet.getBalance().compareTo(new BigDecimal("1000.00")) <= 0);
    }
}
