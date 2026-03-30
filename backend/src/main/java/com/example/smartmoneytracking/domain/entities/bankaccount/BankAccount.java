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
    private String id;

    @Setter(AccessLevel.PRIVATE)
    private String userId;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String bankName;

    private BigDecimal balance;

    @Embedded
    @Setter(AccessLevel.PUBLIC)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    private BankAccountType type;

    private LocalDateTime createdAt;
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
