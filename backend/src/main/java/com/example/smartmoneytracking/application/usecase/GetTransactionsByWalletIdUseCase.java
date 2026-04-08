package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetTransactionsByWalletIdUseCase {

    private final TransactionRepository transactionRepository;
    private final com.example.smartmoneytracking.domain.repositories.WalletRepository walletRepository;
    private final TransactionMapper transactionMapper;

    @Transactional(readOnly = true)
    public List<TransactionResponse> execute(String walletId, String userId) {
        // Security check: Verify wallet belongs to user
        com.example.smartmoneytracking.domain.entities.wallet.Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException("Wallet not found"));
        
        if (!wallet.getUserId().equals(userId)) {
            throw new com.example.smartmoneytracking.domain.exception.BusinessException(com.example.smartmoneytracking.domain.exception.ErrorCode.UNAUTHORIZED_ACCESS);
        }

        List<Transaction> transactions = transactionRepository.findByWalletId(walletId);
        
        // Use optimized batch-fetching mapper to resolve category names in O(1) database complexity
        return transactionMapper.toResponseList(transactions);
    }
}
