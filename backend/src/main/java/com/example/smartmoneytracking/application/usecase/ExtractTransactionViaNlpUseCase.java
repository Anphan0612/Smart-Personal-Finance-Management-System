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

    public NlpExtractTransactionResponse execute(NlpExtractTransactionRequest request) {
        // CategoryId mapping is intentionally left null for now because the backend
        // does not yet expose a reliable Category lookup/find-by-type mechanism.
        return nlpExtractionClient.extractTransaction(request);
    }
}

