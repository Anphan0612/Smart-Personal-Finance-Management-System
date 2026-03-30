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
public class MonthlyTrendDTO {
    private String month;
    private BigDecimal income;
    private BigDecimal expenses;
}
