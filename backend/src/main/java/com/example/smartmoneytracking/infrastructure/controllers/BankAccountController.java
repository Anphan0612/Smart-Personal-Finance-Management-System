package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.dto.BankAccountRequest;
import com.example.smartmoneytracking.application.dto.BankAccountResponse;
import com.example.smartmoneytracking.application.dto.BankAccountUpdateRequest;
import com.example.smartmoneytracking.application.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bank-accounts")
@RequiredArgsConstructor
public class BankAccountController {

    private final CreateBankAccountUseCase createBankAccountUseCase;
    private final GetBankAccountsByUserIdUseCase getBankAccountsByUserIdUseCase;
    private final GetBankAccountByIdUseCase getBankAccountByIdUseCase;
    private final UpdateBankAccountUseCase updateBankAccountUseCase;
    private final DeleteBankAccountUseCase deleteBankAccountUseCase;
    private final com.example.smartmoneytracking.infrastructure.security.SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<BankAccountResponse>> createBankAccount(
            @Valid @RequestBody BankAccountRequest request) {
        String userId = securityUtils.getCurrentUserId();
        BankAccountResponse response = createBankAccountUseCase.execute(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> getBankAccounts() {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(getBankAccountsByUserIdUseCase.execute(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> getBankAccountById(@PathVariable("id") String id) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(getBankAccountByIdUseCase.execute(id, userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> updateBankAccount(@PathVariable("id") String id,
                                                                                    @Valid @RequestBody BankAccountUpdateRequest request) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(updateBankAccountUseCase.execute(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBankAccount(@PathVariable("id") String id) {
        String userId = securityUtils.getCurrentUserId();
        deleteBankAccountUseCase.execute(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
