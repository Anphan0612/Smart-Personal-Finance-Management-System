package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@ActiveProfiles("test")
class TransactionRepositoryIT {

    @Autowired
    private JpaTransactionRepository transactionRepository;

    @Autowired
    private JpaWalletRepository walletRepository;

    private Wallet wallet;

    @BeforeEach
    void setUp() {
        wallet = Wallet.create(
                "repo-user",
                "Repo Wallet",
                new Currency("VND", "₫"),
                WalletType.CASH,
                new BigDecimal("0.00")
        );
        wallet = walletRepository.saveAndFlush(wallet);
    }

    @Test
    void shouldSumExpenseAmountsWithBigDecimalAccuracy() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        transactionRepository.saveAndFlush(Transaction.create(wallet.getId(), null, new BigDecimal("10.10"), TransactionType.EXPENSE, "A", now.minusDays(2)));
        transactionRepository.saveAndFlush(Transaction.create(wallet.getId(), null, new BigDecimal("20.20"), TransactionType.EXPENSE, "B", now.minusDays(1)));

        BigDecimal sum = transactionRepository.sumAmountByWalletIdInAndTransactionDateBetweenAndType(
                List.of(wallet.getId()),
                now.minusDays(10),
                now,
                TransactionType.EXPENSE
        );

        assertNotNull(sum);
        assertEquals(new BigDecimal("30.30"), sum);
    }

    @Test
    void shouldFindTop5TransactionsOrderedByDateDesc() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        for (int i = 0; i < 6; i++) {
            transactionRepository.saveAndFlush(Transaction.create(
                    wallet.getId(),
                    null,
                    new BigDecimal("1.00"),
                    TransactionType.EXPENSE,
                    "tx-" + i,
                    now.minusDays(i)
            ));
        }

        List<Transaction> top5 = transactionRepository.findTop5ByWalletIdOrderByTransactionDateDesc(wallet.getId());
        assertEquals(5, top5.size());
    }
}
