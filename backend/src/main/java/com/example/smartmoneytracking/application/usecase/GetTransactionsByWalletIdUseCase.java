package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.common.PagedResponse;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public PagedResponse<TransactionResponse> execute(String walletId, String userId, int page, int size) {
        // Security check: Verify wallet belongs to user
        com.example.smartmoneytracking.domain.entities.wallet.Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new com.example.smartmoneytracking.domain.exception.BusinessException(com.example.smartmoneytracking.domain.exception.ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate"));
        Page<Transaction> transactionPage = transactionRepository.findByWalletId(walletId, pageable);

        // Use optimized batch-fetching mapper to resolve category names in O(1) database complexity
        List<TransactionResponse> responses = transactionMapper.toResponseList(transactionPage.getContent());

        return PagedResponse.<TransactionResponse>builder()
                .content(responses)
                .page(transactionPage.getNumber())
                .size(transactionPage.getSize())
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .last(transactionPage.isLast())
                .first(transactionPage.isFirst())
                .build();
    }
}
