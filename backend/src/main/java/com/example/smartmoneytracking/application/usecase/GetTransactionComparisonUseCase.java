package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.TransactionComparisonResponse;

public interface GetTransactionComparisonUseCase {
    TransactionComparisonResponse execute(String walletId, String userId);
}
