package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.NlpExtractTransactionRequest;
import com.example.smartmoneytracking.application.dto.NlpExtractTransactionResponse;
import com.example.smartmoneytracking.infrastructure.ai.NlpExtractionClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExtractTransactionViaNlpUseCase {

    private final NlpExtractionClient nlpExtractionClient;
    private final com.example.smartmoneytracking.application.service.CategoryCacheService categoryCacheService;

    public NlpExtractTransactionResponse execute(NlpExtractTransactionRequest request) {
        NlpExtractTransactionResponse response = nlpExtractionClient.extractTransaction(request);
        
        if (response != null && response.getCategory() != null) {
            String aiCategory = response.getCategory().toUpperCase();
            String mappedId = categoryCacheService.getCategoryIdByNlpLabel(aiCategory);
            response.setCategoryId(mappedId); // null if no mapping exists in DB
        }
        
        return response;
    }
}

