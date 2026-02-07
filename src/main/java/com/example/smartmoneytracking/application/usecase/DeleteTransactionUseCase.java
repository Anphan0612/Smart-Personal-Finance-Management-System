package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeleteTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Transactional
    public void execute(String id, String userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for transaction"));

        if (!wallet.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized deletion of transaction");
        }

        transactionRepository.deleteById(id);
    }
}
