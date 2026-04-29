package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.receipt.ReceiptStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class ReceiptResponse {
    private String id;
    private String imageUrl;
    private String storeName;
    private String aiStoreName;
    private BigDecimal amount;
    private BigDecimal aiAmount;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime transactionDate;
    private ReceiptStatus status;
    private String transactionId;
    private Double confidence;
    private Double aiConfidence;
    private String categoryId;
    private String aiCategoryId;
    private Boolean isCorrected;
    private Boolean isMappedFromHistory;
    private String correctionReason;
}
