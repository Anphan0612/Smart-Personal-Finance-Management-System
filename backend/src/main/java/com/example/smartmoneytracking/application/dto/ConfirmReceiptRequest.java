package com.example.smartmoneytracking.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    
    private LocalDateTime transactionDate;
    
    private String description;
}
