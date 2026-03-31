package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.dto.TransactionRequest;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.TransactionUpdateRequest;
import com.example.smartmoneytracking.application.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final CreateTransactionUseCase createTransactionUseCase;
    private final GetTransactionsByWalletIdUseCase getTransactionsByWalletIdUseCase;
    private final GetTransactionByIdUseCase getTransactionByIdUseCase;
    private final UpdateTransactionUseCase updateTransactionUseCase;
    private final DeleteTransactionUseCase deleteTransactionUseCase;
    private final com.example.smartmoneytracking.infrastructure.security.SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        String userId = securityUtils.getCurrentUserId();
        TransactionResponse response = createTransactionUseCase.execute(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(@RequestParam("walletId") String walletId) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(getTransactionsByWalletIdUseCase.execute(walletId, userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(@PathVariable("id") String id) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(getTransactionByIdUseCase.execute(id, userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(@PathVariable("id") String id,
                                                                                    @Valid @RequestBody TransactionUpdateRequest request) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(updateTransactionUseCase.execute(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable("id") String id) {
        String userId = securityUtils.getCurrentUserId();
        deleteTransactionUseCase.execute(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
