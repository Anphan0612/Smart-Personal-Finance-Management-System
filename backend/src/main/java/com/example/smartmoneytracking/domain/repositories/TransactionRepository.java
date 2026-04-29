package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository {
    Transaction save(Transaction transaction);

    Optional<Transaction> findById(String id);

    List<Transaction> findByWalletId(String walletId);

    Page<Transaction> findByWalletId(String walletId, Pageable pageable);

    List<Transaction> findByCategoryId(String categoryId);

    void deleteById(String id);

    List<Transaction> findByWalletIdAndTransactionDateBetween(String walletId, java.time.OffsetDateTime start, java.time.OffsetDateTime end);

    List<Transaction> findTop5ByWalletIdOrderByTransactionDateDesc(String walletId);

    java.math.BigDecimal sumAmountByWalletIdInAndTransactionDateBetweenAndType(
            java.util.List<String> walletIds,
            java.time.OffsetDateTime start,
            java.time.OffsetDateTime end,
            com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType type
    );

    java.math.BigDecimal sumAmountByWalletIdInAndCategoryIdAndTransactionDateBetweenAndType(
            java.util.List<String> walletIds,
            String categoryId,
            java.time.OffsetDateTime start,
            java.time.OffsetDateTime end,
            com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType type
    );
}
