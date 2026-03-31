package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.NlpExtractTransactionRequest;
import com.example.smartmoneytracking.application.dto.NlpExtractTransactionResponse;
import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.usecase.ExtractTransactionViaNlpUseCase;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class NlpAiController {

    private final ExtractTransactionViaNlpUseCase extractTransactionViaNlpUseCase;
    private final SecurityUtils securityUtils;

    @PostMapping("/extract-transaction")
    public ResponseEntity<ApiResponse<NlpExtractTransactionResponse>> extractTransaction(
            @Valid @RequestBody NlpExtractTransactionRequest request) {

        securityUtils.getCurrentUserId();
        NlpExtractTransactionResponse payload = extractTransactionViaNlpUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(payload));
    }
}
