package com.example.smartmoneytracking.application.usecase.impl;

import com.example.smartmoneytracking.application.service.common.DateUtils;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class DashboardUseCaseImplPerfTest {

    @Test
    public void benchmarkStreamAPI() {
        TransactionRepository repository = mock(TransactionRepository.class);
        WalletRepository walletRepository = mock(WalletRepository.class);
        CategoryRepository categoryRepository = mock(CategoryRepository.class);
        TransactionMapper transactionMapper = mock(TransactionMapper.class);
        DashboardUseCaseImpl useCase = new DashboardUseCaseImpl(repository, walletRepository, categoryRepository, transactionMapper);

        int[] transactionCounts = {1000, 10000, 100000, 500000};
        
        System.out.println("\n\n=== BẮT ĐẦU ĐO HIỆU NĂNG JAVA STREAM API ===");
        
        for (int count : transactionCounts) {
            List<Transaction> dummyData = generateTransactions(count);
            when(repository.findByWalletIdAndTransactionDateBetween(anyString(), any(OffsetDateTime.class), any(OffsetDateTime.class)))
                    .thenReturn(dummyData);

            // Warmup JVM (JIT compiler)
            useCase.getDashboardSummary("w1", "current_month");

            // Measure actual time
            long startTime = System.nanoTime();
            useCase.getDashboardSummary("w1", "current_month");
            long endTime = System.nanoTime();

            double durationMs = (endTime - startTime) / 1_000_000.0;
            System.out.printf("Khối lượng dữ liệu: %,d records -> Thời gian Aggregation Memory: %.2f ms%n", count, durationMs);
        }
        System.out.println("=============================================\n\n");
    }

    private List<Transaction> generateTransactions(int count) {
        List<Transaction> list = new ArrayList<>(count);
        OffsetDateTime now = DateUtils.nowUtc().minusDays(10);
        for (int i = 0; i < count; i++) {
            list.add(Transaction.create(
                    "w1",
                    "cat" + (i % 5),
                    BigDecimal.valueOf(Math.random() * 1000),
                    i % 5 == 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
                    "dummy description",
                    now.minusHours(i % 100)
            ));
        }
        return list;
    }
}
