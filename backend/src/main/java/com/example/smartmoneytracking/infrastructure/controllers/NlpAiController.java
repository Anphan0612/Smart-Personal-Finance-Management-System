package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.*;
import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.usecase.ExtractTransactionViaNlpUseCase;
import com.example.smartmoneytracking.application.usecase.QueryHistoryViaNlpUseCase;
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
    private final QueryHistoryViaNlpUseCase queryHistoryViaNlpUseCase;
    private final com.example.smartmoneytracking.infrastructure.ai.NlpExtractionClient nlpExtractionClient;
    private final SecurityUtils securityUtils;

    @PostMapping("/extract-transaction")
    public ResponseEntity<ApiResponse<NlpExtractTransactionResponse>> extractTransaction(
            @Valid @RequestBody NlpExtractTransactionRequest request) {

        securityUtils.getCurrentUserId();
        NlpExtractTransactionResponse payload = extractTransactionViaNlpUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    @PostMapping("/generate-insights")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> generateInsights(
            @RequestBody Object comparisonData) {

        securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(nlpExtractionClient.generateInsights(comparisonData)));
    }

    @PostMapping("/budget-insight")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getBudgetInsight(
            @RequestBody java.util.Map<String, String> request) {

        securityUtils.getCurrentUserId();
        String categoryName = request.get("category_name");
        String threshold = request.get("threshold");
        return ResponseEntity.ok(ApiResponse.success(nlpExtractionClient.getBudgetInsight(categoryName, threshold)));
    }

    @PostMapping("/query-history")
    public ResponseEntity<ApiResponse<NlpQueryResponse>> queryHistory(
            @Valid @RequestBody NlpQueryRequest request) {

        String userId = securityUtils.getCurrentUserId();
        NlpQueryResponse response = queryHistoryViaNlpUseCase.execute(request, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
