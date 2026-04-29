package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private String id;
    private String walletId;
    private String categoryId;
    private String categoryName;
    private com.example.smartmoneytracking.domain.entities.common.MaterialSymbol iconName;
    private BigDecimal amount;
    private String description;
    private TransactionType type;
    private String receiptImageUrl;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime transactionDate;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime createdAt;
}
