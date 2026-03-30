package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.TransactionUpdateRequest;
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
public class UpdateTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Transactional
    public TransactionResponse execute(String id, TransactionUpdateRequest request, String userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for transaction"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized update of transaction");
        }

        if (request.getWalletId() != null && !request.getWalletId().equals(transaction.getWalletId())) {
            // Check ownership of new wallet
            Wallet newWallet = walletRepository.findById(request.getWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("New Wallet not found"));
            if (!newWallet.getUserId().equals(userId)) {
                throw new UnauthorizedException("Unauthorized transfer to target wallet");
            }
            transaction.moveToWallet(request.getWalletId());
        }

        if (request.getCategoryId() != null) {
            transaction.updateCategory(request.getCategoryId());
        }
        if (request.getAmount() != null) {
            transaction.updateAmount(request.getAmount());
        }
        if (request.getDescription() != null) {
            transaction.updateDescription(request.getDescription());
        }
        if (request.getType() != null) {
            transaction.updateType(request.getType());
        }
        if (request.getTransactionDate() != null) {
            transaction.updateDate(request.getTransactionDate());
        }

        Transaction savedTransaction = transactionRepository.save(transaction);

        return TransactionResponse.builder()
                .id(savedTransaction.getId())
                .walletId(savedTransaction.getWalletId())
                .categoryId(savedTransaction.getCategoryId())
                .amount(savedTransaction.getAmount())
                .description(savedTransaction.getDescription())
                .type(savedTransaction.getType())
                .transactionDate(savedTransaction.getTransactionDate())
                .createdAt(savedTransaction.getCreatedAt())
                .build();
    }
}
