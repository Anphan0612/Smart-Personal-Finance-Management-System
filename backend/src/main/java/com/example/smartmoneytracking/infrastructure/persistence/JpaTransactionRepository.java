package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaTransactionRepository extends JpaRepository<Transaction, String>, TransactionRepository {
    java.util.List<Transaction> findByWalletIdAndTransactionDateBetween(String walletId, java.time.OffsetDateTime start, java.time.OffsetDateTime end);

    java.util.List<Transaction> findTop5ByWalletIdOrderByTransactionDateDesc(String walletId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.walletId IN :walletIds AND t.transactionDate BETWEEN :start AND :end AND t.type = :type")
    java.math.BigDecimal sumAmountByWalletIdInAndTransactionDateBetweenAndType(
            @org.springframework.data.repository.query.Param("walletIds") java.util.List<String> walletIds,
            @org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start,
            @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end,
            @org.springframework.data.repository.query.Param("type") com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType type
    );

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.walletId IN :walletIds AND t.categoryId = :categoryId AND t.transactionDate BETWEEN :start AND :end AND t.type = :type")
    java.math.BigDecimal sumAmountByWalletIdInAndCategoryIdAndTransactionDateBetweenAndType(
            @org.springframework.data.repository.query.Param("walletIds") java.util.List<String> walletIds,
            @org.springframework.data.repository.query.Param("categoryId") String categoryId,
            @org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start,
            @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end,
            @org.springframework.data.repository.query.Param("type") com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType type
    );
}
