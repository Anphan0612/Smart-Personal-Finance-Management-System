package com.example.smartmoneytracking.domain.entities.wallet;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.*;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
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
@Table(name = "wallets")
public class Wallet {

    @Id
    @Setter(AccessLevel.PRIVATE)
    private String id;

    @Setter(AccessLevel.PRIVATE) // ID should not change, but maybe needed for initial setup if not auto-gen
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(name = "initial_balance", nullable = false)
    @Setter(AccessLevel.PRIVATE)
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @Embedded
    @Setter(AccessLevel.PUBLIC) // Currency might be changeable? Or should be final? Let's allow setting for now
    // but ideally it's part of creation
    private Currency currency;

    @Enumerated(EnumType.STRING)
    @Setter(AccessLevel.PUBLIC)
    private WalletType walletType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (balance == null)
            balance = initialBalance;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Business Methods

    public void updateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Wallet name cannot be empty");
        }
        this.name = name;
    }

    public void deposit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance = this.balance.add(amount);
    }

    public void withdraw(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (this.balance.compareTo(amount) < 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE, "Insufficient balance in wallet: " + this.name);
        }
        this.balance = this.balance.subtract(amount);
    }

    // Factory method for simpler creation
    public static Wallet create(String userId, String name, Currency currency, WalletType type, BigDecimal initialBalance) {
        Wallet wallet = new Wallet();
        wallet.userId = userId; // Private setter access
        wallet.updateName(name);
        wallet.currency = currency;
        wallet.walletType = type;
        if (initialBalance != null) {
            wallet.initialBalance = initialBalance;
            wallet.balance = initialBalance;
        } else {
            wallet.initialBalance = BigDecimal.ZERO;
            wallet.balance = BigDecimal.ZERO;
        }
        return wallet;
    }

    // Administrative method to correct balance
    public void reviseBalance(BigDecimal newBalance) {
        if (newBalance == null) {
            throw new IllegalArgumentException("Balance cannot be null");
        }
        this.balance = newBalance;
    }
}