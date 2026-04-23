package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.TransactionUpdateRequest;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
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
    private final TransactionMapper transactionMapper;

    @Transactional
    public TransactionResponse execute(String id, TransactionUpdateRequest request, String userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for transaction"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized update of transaction");
        }

        // 1. Revert Old Transaction from current Wallet
        if (transaction.isExpense()) {
            wallet.deposit(transaction.getAmount());
        } else if (transaction.isIncome()) {
            wallet.withdraw(transaction.getAmount());
        }

        Wallet targetWallet = wallet;

        if (request.getWalletId() != null && !request.getWalletId().equals(transaction.getWalletId())) {
            Wallet newWallet = walletRepository.findById(request.getWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("New Wallet not found"));
            if (!newWallet.getUserId().equals(userId)) {
                throw new UnauthorizedException("Unauthorized transfer to target wallet");
            }
            transaction.moveToWallet(request.getWalletId());
            targetWallet = newWallet;
        }

        if (request.getCategoryId() != null) transaction.updateCategory(request.getCategoryId());
        if (request.getAmount() != null) transaction.updateAmount(request.getAmount());
        if (request.getDescription() != null) transaction.updateDescription(request.getDescription());
        if (request.getType() != null) transaction.updateType(request.getType());
        if (request.getTransactionDate() != null) transaction.updateDate(request.getTransactionDate().withOffsetSameInstant(java.time.ZoneOffset.UTC));

        // 2. Apply New Transaction details to target Wallet
        if (transaction.isExpense()) {
            targetWallet.withdraw(transaction.getAmount());
        } else if (transaction.isIncome()) {
            targetWallet.deposit(transaction.getAmount());
        }

        // 3. Save repositories
        if (!wallet.getId().equals(targetWallet.getId())) {
             walletRepository.save(wallet);
        }
        walletRepository.save(targetWallet);

        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Standardized mapping via centralized Mapper
        return transactionMapper.toResponse(savedTransaction);
    }
}
