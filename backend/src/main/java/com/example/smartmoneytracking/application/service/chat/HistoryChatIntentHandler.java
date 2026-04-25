package com.example.smartmoneytracking.application.service.chat;

import com.example.smartmoneytracking.application.dto.AtelierChatRequest;
import com.example.smartmoneytracking.application.dto.AtelierChatResponse;
import com.example.smartmoneytracking.application.dto.NlpExtractTransactionRequest;
import com.example.smartmoneytracking.application.dto.NlpExtractTransactionResponse;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.service.AiChatIntentHandler;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.infrastructure.ai.NlpExtractionClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoryChatIntentHandler implements AiChatIntentHandler {

    private final NlpExtractionClient nlpExtractionClient;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public boolean canHandle(String intent) {
        return "HISTORY".equalsIgnoreCase(intent) || "QUERY".equalsIgnoreCase(intent);
    }

    @Override
    public AtelierChatResponse handle(AtelierChatRequest request, String userId) {
        String walletId = request.getWalletId();
        OffsetDateTime end = OffsetDateTime.now();
        OffsetDateTime start = end.minusDays(90);

        List<Transaction> transactions = transactionRepository
                .findByWalletIdAndTransactionDateBetween(walletId, start, end);

        Set<String> categoryIds = transactions.stream()
                .map(Transaction::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, String> categoryIdToName = new HashMap<>();
        Map<String, String> categoryIdToNlpLabel = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds).forEach(cat -> {
                categoryIdToName.put(cat.getId(), cat.getName());
                if (cat.getNlpLabel() != null) {
                    categoryIdToNlpLabel.put(cat.getId(), cat.getNlpLabel());
                }
            });
        }

        List<Map<String, Object>> txnMaps = transactions.stream()
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.getId());
                    map.put("amount", t.getAmount().intValue());
                    map.put("type", t.getType().name());
                    map.put("category", categoryIdToNlpLabel.getOrDefault(
                            t.getCategoryId(),
                            categoryIdToName.getOrDefault(t.getCategoryId(), "OTHER_EXPENSE")
                    ));
                    map.put("categoryName", categoryIdToName.getOrDefault(t.getCategoryId(), "Khác"));
                    map.put("description", t.getDescription());
                    map.put("transactionDate", t.getTransactionDate().toLocalDate().toString());
                    return map;
                })
                .collect(Collectors.toList());

        // We map message to text for the AI service
        Map<String, Object> aiResult = nlpExtractionClient.queryHistory(request.getMessage(), txnMaps);

        String intent = String.valueOf(aiResult.getOrDefault("intent", "COMMAND"));

        @SuppressWarnings("unchecked")
        Map<String, Object> filters = (Map<String, Object>) aiResult.getOrDefault("filters", Map.of());
        String answer = String.valueOf(aiResult.getOrDefault("answer", ""));

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) aiResult.getOrDefault("summary", Map.of());

        @SuppressWarnings("unchecked")
        List<String> matchedIds = (List<String>) aiResult.getOrDefault("matched_txn_ids", Collections.emptyList());

        List<TransactionResponse> matched = Collections.emptyList();
        if ("QUERY".equals(intent) && !transactions.isEmpty()) {
            matched = transactions.stream()
                    .filter(t -> matchedIds.contains(t.getId()))
                    .sorted(Comparator.comparing(Transaction::getTransactionDate).reversed())
                    .limit(10)
                    .map(t -> TransactionResponse.builder()
                            .id(t.getId())
                            .walletId(t.getWalletId())
                            .categoryId(t.getCategoryId())
                            .categoryName(categoryIdToName.getOrDefault(t.getCategoryId(), "Khác"))
                            .amount(t.getAmount())
                            .description(t.getDescription())
                            .type(t.getType())
                            .transactionDate(t.getTransactionDate())
                            .createdAt(t.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("filters", filters);
        responseData.put("summary", summary);
        responseData.put("transactions", matched);

        return AtelierChatResponse.builder()
                .message(answer)
                .data(responseData)
                .type(intent)
                .build();
    }
}
