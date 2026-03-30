package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.bankaccount.valueobject.BankAccountType;
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
public class BankAccountResponse {
    private String id;
    private String userId;
    private String accountNumber;
    private String bankName;
    private BigDecimal balance;
    private String currencyCode;
    private String currencySymbol;
    private BankAccountType type;
    private LocalDateTime createdAt;
}
