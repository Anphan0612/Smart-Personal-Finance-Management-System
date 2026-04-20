package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionUpdateRequest {

    private String walletId;
    private String categoryId;

    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String description;
    private TransactionType type;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime transactionDate;
}
