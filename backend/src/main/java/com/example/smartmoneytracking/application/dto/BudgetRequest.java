package com.example.smartmoneytracking.application.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    private String categoryId; // Can be null for total budget
    private BigDecimal amount;
    private int month;
    private int year;
}
