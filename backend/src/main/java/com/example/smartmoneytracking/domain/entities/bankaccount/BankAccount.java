package com.example.smartmoneytracking.domain.entities.bankaccount;

import com.example.smartmoneytracking.domain.entities.bankaccount.valueobject.BankAccountType;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bank_accounts")
public class BankAccount {

    @Id
    @Setter(AccessLevel.PRIVATE)
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Setter(AccessLevel.PRIVATE)
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(precision = 19, scale = 2)
    private BigDecimal balance;

    @Embedded
    @Setter(AccessLevel.PUBLIC)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 32, columnDefinition = "VARCHAR(32)")
    private BankAccountType type;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static BankAccount create(String userId, String accountNumber, String bankName, BigDecimal balance,
                                     Currency currency, BankAccountType type) {
        BankAccount account = new BankAccount();
        account.userId = userId;
        account.updateDetails(accountNumber, bankName, type);
        account.reviseBalance(balance != null ? balance : BigDecimal.ZERO);
        account.currency = currency;
        return account;
    }

    public void updateDetails(String accountNumber, String bankName, BankAccountType type) {
        if (accountNumber != null && !accountNumber.trim().isEmpty())
            this.accountNumber = accountNumber;
        if (bankName != null && !bankName.trim().isEmpty())
            this.bankName = bankName;
        if (type != null)
            this.type = type;
    }

    public void reviseBalance(BigDecimal newBalance) {
        if (newBalance == null)
            throw new IllegalArgumentException("Balance cannot be null");
        this.balance = newBalance;
    }
}
