package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.common.MaterialSymbol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private String id;
    private String categoryId;
    private String categoryName;
    private MaterialSymbol iconName;
    private BigDecimal limitAmount;
    private BigDecimal currentSpending;
    private double percentageUsed;
    private String thresholdStatus;
    private BigDecimal remainingAmount;
    private int month;
    private int year;
}
