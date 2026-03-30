package com.example.smartmoneytracking.domain.entities.bankaccount;

import com.example.smartmoneytracking.domain.entities.bankaccount.valueobject.BankAccountType;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {

    @Test
    void shouldCreateBankAccountSuccessfully() {
        BankAccount account = BankAccount.create(
                "user1",
                "123456789",
                "Bank A",
                new BigDecimal("1000.00"),
                new Currency("USD", "$"),
                BankAccountType.SAVINGS);

        assertNotNull(account);
        assertEquals("user1", account.getUserId());
        assertEquals("123456789", account.getAccountNumber());
        assertEquals("Bank A", account.getBankName());
        assertEquals(new BigDecimal("1000.00"), account.getBalance());
        assertEquals(BankAccountType.SAVINGS, account.getType());
    }

    @Test
    void shouldUpdateDetailsSuccessfully() {
        BankAccount account = BankAccount.create(
                "user1",
                "123456789",
                "Bank A",
                new BigDecimal("1000.00"),
                new Currency("USD", "$"),
                BankAccountType.SAVINGS);

        account.updateDetails("987654321", "Bank B", BankAccountType.CHECKING);

        assertEquals("987654321", account.getAccountNumber());
        assertEquals("Bank B", account.getBankName());
        assertEquals(BankAccountType.CHECKING, account.getType());
    }

    @Test
    void shouldReviseBalanceSuccessfully() {
        BankAccount account = BankAccount.create(
                "user1",
                "123456789",
                "Bank A",
                new BigDecimal("1000.00"),
                new Currency("USD", "$"),
                BankAccountType.SAVINGS);

        account.reviseBalance(new BigDecimal("2000.00"));
        assertEquals(new BigDecimal("2000.00"), account.getBalance());
    }

    @Test
    void shouldThrowExceptionWhenReviseBalanceToNull() {
        BankAccount account = BankAccount.create(
                "user1",
                "123456789",
                "Bank A",
                new BigDecimal("1000.00"),
                new Currency("USD", "$"),
                BankAccountType.SAVINGS);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            account.reviseBalance(null);
        });

        assertEquals("Balance cannot be null", exception.getMessage());
    }
}
