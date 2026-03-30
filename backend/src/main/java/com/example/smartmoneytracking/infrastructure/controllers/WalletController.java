package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.CommonApiResponse;
import com.example.smartmoneytracking.application.dto.WalletRequest;
import com.example.smartmoneytracking.application.dto.WalletResponse;
import com.example.smartmoneytracking.application.dto.WalletUpdateRequest;
import com.example.smartmoneytracking.application.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final CreateWalletUseCase createWalletUseCase;
    private final GetWalletsByUserIdUseCase getWalletsByUserIdUseCase;
    private final GetWalletByIdUseCase getWalletByIdUseCase;
    private final UpdateWalletUseCase updateWalletUseCase;
    private final DeleteWalletUseCase deleteWalletUseCase;
    private final com.example.smartmoneytracking.infrastructure.security.SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<CommonApiResponse<WalletResponse>> createWallet(@Valid @RequestBody WalletRequest request) {
        String userId = securityUtils.getCurrentUserId();
        WalletResponse response = createWalletUseCase.execute(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonApiResponse.created(response));
    }

    @GetMapping
    public ResponseEntity<CommonApiResponse<List<WalletResponse>>> getWallets() {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(CommonApiResponse.success(getWalletsByUserIdUseCase.execute(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonApiResponse<WalletResponse>> getWalletById(@PathVariable("id") String id) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(CommonApiResponse.success(getWalletByIdUseCase.execute(id, userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommonApiResponse<WalletResponse>> updateWallet(@PathVariable("id") String id,
                                                                          @Valid @RequestBody WalletUpdateRequest request) {
        String userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(CommonApiResponse.success(updateWalletUseCase.execute(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CommonApiResponse<Void>> deleteWallet(@PathVariable("id") String id) {
        String userId = securityUtils.getCurrentUserId();
        deleteWalletUseCase.execute(id, userId);
        return ResponseEntity.ok(CommonApiResponse.success(null));
    }
}
