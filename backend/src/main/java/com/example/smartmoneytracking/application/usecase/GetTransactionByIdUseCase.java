package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetTransactionByIdUseCase {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Transactional(readOnly = true)
    public TransactionResponse execute(String id, String userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for transaction"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to transaction");
        }

        return TransactionResponse.builder()
                .id(transaction.getId())
                .walletId(transaction.getWalletId())
                .categoryId(transaction.getCategoryId())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .type(transaction.getType())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
