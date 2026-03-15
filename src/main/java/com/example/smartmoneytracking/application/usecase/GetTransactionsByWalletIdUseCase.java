package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetTransactionsByWalletIdUseCase {

    private final TransactionRepository transactionRepository;
    private final com.example.smartmoneytracking.domain.repositories.WalletRepository walletRepository;

    @Transactional(readOnly = true)
    public List<TransactionResponse> execute(String walletId, String userId) {
        com.example.smartmoneytracking.domain.entities.wallet.Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to wallet transactions");
        }

        return transactionRepository.findByWalletId(walletId).stream()
                .map(transaction -> TransactionResponse.builder()
                        .id(transaction.getId())
                        .walletId(transaction.getWalletId())
                        .categoryId(transaction.getCategoryId())
                        .amount(transaction.getAmount())
                        .description(transaction.getDescription())
                        .type(transaction.getType())
                        .transactionDate(transaction.getTransactionDate())
                        .createdAt(transaction.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
