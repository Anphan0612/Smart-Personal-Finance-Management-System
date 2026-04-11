package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.receipt.ReceiptStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ReceiptResponse {
    private String id;
    private String imageUrl;
    private String storeName;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private ReceiptStatus status;
    private String transactionId;
    private Double confidence;
    private String categoryId;
    private Boolean isCorrected;
    private String correctionReason;
}
