package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionRequest;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public TransactionResponse execute(TransactionRequest request, String userId) {
        // 1. Validate category exists (only if provided)
        if (request.getCategoryId() != null && !request.getCategoryId().isBlank()) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND,
                            "Category not found: " + request.getCategoryId()));
        }

        // 2. Fetch Wallet
        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized transaction creation");
        }

        // 3. Validate Balance for Expense
        if (request.getType() == TransactionType.EXPENSE) {
            wallet.withdraw(request.getAmount());
        } else if (request.getType() == TransactionType.INCOME) {
            wallet.deposit(request.getAmount());
        }

        // 4. Save Wallet update
        walletRepository.save(wallet);

        // 5. Create Transaction
        Transaction transaction = Transaction.create(
                wallet.getId(),
                request.getCategoryId(),
                request.getAmount(),
                request.getType(),
                request.getDescription(),
                request.getTransactionDate());

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
