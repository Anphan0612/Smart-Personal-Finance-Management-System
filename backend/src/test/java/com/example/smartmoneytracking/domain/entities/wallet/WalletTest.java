package com.example.smartmoneytracking.domain.entities.wallet;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class WalletTest {

    @Test
    void shouldCreateWalletSuccessfully() {
        Wallet wallet = Wallet.create("user1", "My Wallet", new Currency("USD", "$"), WalletType.CASH, BigDecimal.ZERO);

        assertNotNull(wallet);
        assertEquals("user1", wallet.getUserId());
        assertEquals("My Wallet", wallet.getName());
        assertEquals(BigDecimal.ZERO, wallet.getBalance());
        assertEquals(WalletType.CASH, wallet.getWalletType());
    }

    @Test
    void shouldDepositSuccessfully() {
        Wallet wallet = Wallet.create("user1", "My Wallet", new Currency("USD", "$"), WalletType.CASH, BigDecimal.ZERO);
        wallet.deposit(new BigDecimal("100.00"));

        assertEquals(new BigDecimal("100.00"), wallet.getBalance());
    }

    @Test
    void shouldThrowExceptionWhenDepositNegativeAmount() {
        Wallet wallet = Wallet.create("user1", "My Wallet", new Currency("USD", "$"), WalletType.CASH, BigDecimal.ZERO);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            wallet.deposit(new BigDecimal("-10.00"));
        });

        assertEquals("Deposit amount must be positive", exception.getMessage());
    }

    @Test
    void shouldWithdrawSuccessfully() {
        Wallet wallet = Wallet.create("user1", "My Wallet", new Currency("USD", "$"), WalletType.CASH, BigDecimal.ZERO);
        wallet.reviseBalance(new BigDecimal("100.00"));

        wallet.withdraw(new BigDecimal("50.00"));

        assertEquals(new BigDecimal("50.00"), wallet.getBalance());
    }

    @Test
    void shouldThrowExceptionWhenWithdrawInsufficientBalance() {
        Wallet wallet = Wallet.create("user1", "My Wallet", new Currency("USD", "$"), WalletType.CASH, BigDecimal.ZERO);
        wallet.reviseBalance(new BigDecimal("50.00"));

        Exception exception = assertThrows(com.example.smartmoneytracking.domain.exception.BusinessException.class, () -> {
            wallet.withdraw(new BigDecimal("100.00"));
        });

        assertEquals("Insufficient balance in wallet: My Wallet", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenWithdrawNegativeAmount() {
        Wallet wallet = Wallet.create("user1", "My Wallet", new Currency("USD", "$"), WalletType.CASH, BigDecimal.ZERO);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            wallet.withdraw(new BigDecimal("-10.00"));
        });

        assertEquals("Withdrawal amount must be positive", exception.getMessage());
    }
}
