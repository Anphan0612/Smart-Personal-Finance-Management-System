package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.NlpExtractTransactionRequest;
import com.example.smartmoneytracking.application.dto.NlpExtractTransactionResponse;
import com.example.smartmoneytracking.application.dto.common.CommonApiResponse;
import com.example.smartmoneytracking.application.usecase.ExtractTransactionViaNlpUseCase;
import com.example.smartmoneytracking.infrastructure.ai.NlpExtractionException;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class NlpAiController {

    private final ExtractTransactionViaNlpUseCase extractTransactionViaNlpUseCase;
    private final SecurityUtils securityUtils;

    @PostMapping("/extract-transaction")
    public ResponseEntity<CommonApiResponse<NlpExtractTransactionResponse>> extractTransaction(
            @Valid @RequestBody NlpExtractTransactionRequest request) {
        // Ensure JWT auth is present (pattern matches existing controllers).
        securityUtils.getCurrentUserId();

        try {
            NlpExtractTransactionResponse payload = extractTransactionViaNlpUseCase.execute(request);
            return ResponseEntity.ok(CommonApiResponse.success(payload));
        } catch (NlpExtractionException ex) {
            String message = ex.getMessage();
            List<String> errors = ex.getSuggestion() == null ? null : List.of(ex.getSuggestion());
            int statusCode = 422;
            return ResponseEntity.status(statusCode)
                    .body(CommonApiResponse.error(statusCode, message, errors));
        }
    }
}

