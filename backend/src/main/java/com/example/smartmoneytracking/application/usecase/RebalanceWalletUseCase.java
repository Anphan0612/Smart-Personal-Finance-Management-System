package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RebalanceWalletUseCase {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public BigDecimal execute(String walletId, String userId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to wallet");
        }

        List<Transaction> transactions = transactionRepository.findByWalletId(walletId);

        BigDecimal calculatedBalance = wallet.getInitialBalance();

        for (Transaction transaction : transactions) {
            if (transaction.isExpense()) {
                calculatedBalance = calculatedBalance.subtract(transaction.getAmount());
            } else if (transaction.isIncome()) {
                calculatedBalance = calculatedBalance.add(transaction.getAmount());
            }
        }

        wallet.reviseBalance(calculatedBalance);
        walletRepository.save(wallet);

        return calculatedBalance;
    }
}
