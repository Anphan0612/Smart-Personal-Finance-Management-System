package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.NlpQueryRequest;
import com.example.smartmoneytracking.application.dto.NlpQueryResponse;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.mapper.TransactionMapper;
import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.infrastructure.ai.NlpExtractionClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueryHistoryViaNlpUseCase {

    private final NlpExtractionClient nlpExtractionClient;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public NlpQueryResponse execute(NlpQueryRequest request, String userId) {
        // 1. Fetch all transactions for this wallet (last 90 days for context)
        String walletId = request.getWalletId();
        java.time.OffsetDateTime end = java.time.OffsetDateTime.now();
        java.time.OffsetDateTime start = end.minusDays(90);

        List<Transaction> transactions = transactionRepository
                .findByWalletIdAndTransactionDateBetween(walletId, start, end);

        // 2. Build category name map
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

        // 3. Convert transactions to simple maps for AI service
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

        // 4. Call AI service
        Map<String, Object> aiResult = nlpExtractionClient.queryHistory(request.getText(), txnMaps);

        // 5. Build response
        String intent = String.valueOf(aiResult.getOrDefault("intent", "COMMAND"));

        @SuppressWarnings("unchecked")
        Map<String, Object> filters = (Map<String, Object>) aiResult.getOrDefault("filters", Map.of());
        String answer = String.valueOf(aiResult.getOrDefault("answer", ""));

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) aiResult.getOrDefault("summary", Map.of());

        @SuppressWarnings("unchecked")
        List<String> matchedIds = (List<String>) aiResult.getOrDefault("matched_txn_ids", Collections.emptyList());

        // 6. If QUERY, include matched transactions for mobile rendering
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

        return NlpQueryResponse.builder()
                .intent(intent)
                .filters(filters)
                .answer(answer)
                .summary(summary)
                .matchedTransactions(matched)
                .build();
    }
}
