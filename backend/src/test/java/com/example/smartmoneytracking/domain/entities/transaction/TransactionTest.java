package com.example.smartmoneytracking.domain.entities.transaction;

import com.example.smartmoneytracking.application.service.common.DateUtils;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TransactionTest {

    @Test
    void shouldCreateTransactionSuccessfully() {
        Transaction tx = Transaction.create(
                "wallet1",
                "cat1",
                new BigDecimal("100.00"),
                TransactionType.EXPENSE,
                "Lunch",
                DateUtils.nowUtc());

        assertNotNull(tx);
        assertEquals("wallet1", tx.getWalletId());
        assertEquals(new BigDecimal("100.00"), tx.getAmount());
        assertTrue(tx.isExpense());
        assertFalse(tx.isIncome());
    }

    @Test
    void shouldThrowExceptionWhenAmountIsNegative() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            Transaction.create(
                    "wallet1",
                    "cat1",
                    new BigDecimal("-100.00"),
                    TransactionType.EXPENSE,
                    "Lunch",
                    DateUtils.nowUtc());
        });

        assertEquals("Transaction amount must be positive", exception.getMessage());
    }

    @Test
    void shouldUpdateTransactionFields() {
        Transaction tx = Transaction.create(
                "wallet1",
                "cat1",
                new BigDecimal("100.00"),
                TransactionType.EXPENSE,
                "Lunch",
                DateUtils.nowUtc());

        tx.updateAmount(new BigDecimal("200.00"));
        assertEquals(new BigDecimal("200.00"), tx.getAmount());

        tx.moveToWallet("wallet2");
        assertEquals("wallet2", tx.getWalletId());
    }
}
