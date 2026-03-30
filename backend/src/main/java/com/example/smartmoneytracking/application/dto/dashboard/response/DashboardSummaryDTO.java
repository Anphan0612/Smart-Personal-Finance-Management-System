package com.example.smartmoneytracking.application.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDTO {
    private BigDecimal income;
    private BigDecimal expenses;
    private BigDecimal balance;
    private Double savingsRate;
}
