package com.example.smartmoneytracking.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BudgetPlanningResponse {
    private BigDecimal targetSpending;
    private BigDecimal totalAllocated;
    private BigDecimal remainingAmount;
    private int month;
    private int year;
}
