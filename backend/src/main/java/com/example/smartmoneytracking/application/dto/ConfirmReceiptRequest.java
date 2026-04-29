package com.example.smartmoneytracking.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class ConfirmReceiptRequest {
    @NotBlank
    private String walletId;
    
    @NotBlank
    private String categoryId;
    
    @NotBlank
    private String storeName;
    
    @NotNull
    private BigDecimal amount;
    
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime transactionDate;
    
    private String description;
}
