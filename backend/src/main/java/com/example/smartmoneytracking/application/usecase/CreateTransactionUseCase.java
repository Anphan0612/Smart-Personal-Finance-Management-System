package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionRequest;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.application.service.common.DateUtils;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;

    @Transactional
    public TransactionResponse execute(TransactionRequest request, String userId) {
        // 1. Validate Wallet exists and belongs to user
        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "You do not own this wallet");
        }

        // 2. Validate Category exists (only for non-TRANSFER transactions)
        if (request.getCategoryId() != null && !request.getCategoryId().isBlank()) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        } else if (request.getType() != null && !request.getType().equals(TransactionType.TRANSFER)) {
            // Category is required for INCOME and EXPENSE transactions
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Category is required for " + request.getType() + " transactions");
        }

        Transaction transaction = Transaction.create(
                request.getWalletId(),
                request.getCategoryId(),
                request.getAmount(),
                request.getType(),
                request.getDescription(),
                DateUtils.localToUtc(request.getTransactionDate())
        );

        // Wallet validation and balance update
        if (transaction.isExpense()) {
            wallet.withdraw(transaction.getAmount());
        } else if (transaction.isIncome()) {
            wallet.deposit(transaction.getAmount());
        }

        if (request.getReceiptImageUrl() != null) {
            transaction.updateReceiptImageUrl(request.getReceiptImageUrl());
        }

        Transaction savedTransaction = transactionRepository.save(transaction);
        walletRepository.save(wallet);

        // Standardized mapping via centralized Mapper
        return transactionMapper.toResponse(savedTransaction);
    }
}
