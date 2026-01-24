package com.example.smartmoneytracking.domain.entities.transaction;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {
    private Long id;
    private Long userId;
    private Long categoryId;
    private LocalDateTime transactionDate;
    private BigDecimal amount;
    private String note;
    private LocalDateTime createdAt;
}
