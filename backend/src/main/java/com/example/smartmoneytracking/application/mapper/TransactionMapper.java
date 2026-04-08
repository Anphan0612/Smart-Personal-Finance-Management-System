package com.example.smartmoneytracking.application.mapper;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TransactionMapper {

    private final CategoryRepository categoryRepository;

    public TransactionResponse toResponse(Transaction transaction) {
        String categoryName = "Other";
        com.example.smartmoneytracking.domain.entities.common.MaterialSymbol iconName = com.example.smartmoneytracking.domain.entities.common.MaterialSymbol.LIST;

        if (transaction.getCategoryId() != null) {
            Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
            if (category != null) {
                categoryName = category.getName();
                iconName = category.getIconName();
            }
        }

        return buildResponse(transaction, categoryName, iconName);
    }

    public List<TransactionResponse> toResponseList(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return Collections.emptyList();
        }

        // Batch fetch categories to avoid N+1 queries
        Set<String> categoryIds = transactions.stream()
                .map(Transaction::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Category> categoryMap = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository .findAllById(categoryIds).forEach(cat ->
                categoryMap.put(cat.getId(), cat)
            );
        }

        return transactions.stream()
                .map(t -> {
                    Category cat = categoryMap.get(t.getCategoryId());
                    String name = cat != null ? cat.getName() : "Other";
                    com.example.smartmoneytracking.domain.entities.common.MaterialSymbol icon = cat != null ? cat.getIconName() : com.example.smartmoneytracking.domain.entities.common.MaterialSymbol.LIST;
                    return buildResponse(t, name, icon);
                })
                .collect(Collectors.toList());
    }

    private TransactionResponse buildResponse(Transaction t, String categoryName, com.example.smartmoneytracking.domain.entities.common.MaterialSymbol iconName) {
        return TransactionResponse.builder()
                .id(t.getId())
                .walletId(t.getWalletId())
                .amount(t.getAmount())
                .categoryId(t.getCategoryId())
                .categoryName(categoryName)
                .iconName(iconName)
                .description(t.getDescription())
                .transactionDate(t.getTransactionDate())
                .createdAt(t.getCreatedAt())
                .type(t.getType())
                .build();
    }
}
