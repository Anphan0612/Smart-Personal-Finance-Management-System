package com.example.smartmoneytracking.domain.entities.transaction;

import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AccessLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @Setter(AccessLevel.PRIVATE)
    private String id;

    @Setter(AccessLevel.PRIVATE)
    @Column(name = "wallet_id")
    private String walletId;

    @Setter(AccessLevel.PUBLIC) // Category can be updated?
    @Column(name = "category_id")
    private String categoryId;

    @Column(nullable = true)
    @Setter(AccessLevel.PRIVATE) // Date usually fixed at creation, but maybe editable?
    private LocalDateTime transactionDate;

    @Column(nullable = false)
    @Setter(AccessLevel.PRIVATE) // Amount shouldn't change easily without affecting wallet balance. Better to
    // reverse and recreate, or strict update logic.
    private BigDecimal amount;

    @Setter(AccessLevel.PUBLIC)
    private String description;

    @Enumerated(EnumType.STRING)
    @Setter(AccessLevel.PRIVATE)
    private TransactionType type;

    @Setter(AccessLevel.PUBLIC)
    @Column(name = "receipt_image_url")
    private String receiptImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (transactionDate == null)
            transactionDate = LocalDateTime.now();
    }

    public static Transaction create(String walletId, String categoryId, BigDecimal amount, TransactionType type,
                                     String description, LocalDateTime date) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }

        Transaction tx = new Transaction();
        tx.walletId = walletId;
        tx.categoryId = categoryId;
        tx.amount = amount;
        tx.type = type;
        tx.description = description;
        tx.transactionDate = date != null ? date : LocalDateTime.now();
        return tx;
    }

    public boolean isIncome() {
        return TransactionType.INCOME.equals(this.type);
    }

    public boolean isExpense() {
        return TransactionType.EXPENSE.equals(this.type);
    }

    // Update Methods
    public void moveToWallet(String newWalletId) {
        if (newWalletId == null || newWalletId.trim().isEmpty())
            throw new IllegalArgumentException("Wallet ID cannot be empty");
        this.walletId = newWalletId;
    }

    public void updateCategory(String categoryId) {
        this.categoryId = categoryId;
    }

    public void updateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        this.amount = amount;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public void updateType(TransactionType type) {
        if (type == null)
            throw new IllegalArgumentException("Type cannot be null");
        this.type = type;
    }

    public void updateDate(LocalDateTime date) {
        this.transactionDate = date != null ? date : LocalDateTime.now();
    }

    public void updateReceiptImageUrl(String url) {
        this.receiptImageUrl = url;
    }
}
