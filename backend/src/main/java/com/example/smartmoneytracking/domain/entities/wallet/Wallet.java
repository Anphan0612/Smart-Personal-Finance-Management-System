package com.example.smartmoneytracking.domain.entities.wallet;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.*;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.domain.exception.InsufficientBalanceException;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AccessLevel;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
    @Column(name = "user_id")
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
    @Column(name = "wallet_type")
    private WalletType walletType;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "branch")
    private String branch;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (balance == null)
            balance = initialBalance;
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // Business Methods

    public void updateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Wallet name cannot be empty");
        }
        this.name = name;
    }

    public void updateBankDetails(String bankName, String accountNumber, String branch) {
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.branch = branch;
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
            throw new InsufficientBalanceException("Insufficient balance in wallet: " + this.name);
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

    public static Wallet createBankWallet(String userId, String name, Currency currency, BigDecimal initialBalance, 
                                          String bankName, String accountNumber, String branch) {
        Wallet wallet = create(userId, name, currency, WalletType.BANK, initialBalance);
        wallet.updateBankDetails(bankName, accountNumber, branch);
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