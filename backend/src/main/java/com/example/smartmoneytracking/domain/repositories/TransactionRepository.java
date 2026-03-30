package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository {
    Transaction save(Transaction transaction);

    Optional<Transaction> findById(String id);

    List<Transaction> findByWalletId(String walletId);

    List<Transaction> findByCategoryId(String categoryId);

    void deleteById(String id);

    List<Transaction> findByWalletIdAndTransactionDateBetween(String walletId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
