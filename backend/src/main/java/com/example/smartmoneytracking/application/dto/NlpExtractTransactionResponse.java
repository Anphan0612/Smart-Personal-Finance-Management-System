package com.example.smartmoneytracking.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NlpExtractTransactionResponse {
    private BigDecimal amount;
    private String type;
    private String category;
    private String date;
    private String note;
    private Double confidence;

    /**
     * Temporary mapping. For now this is not persisted/validated against DB categories yet.
     */
    private String categoryId;
}

