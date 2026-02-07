package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.bankaccount.valueobject.BankAccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BankAccountRequest {
    private String accountNumber;
    private String bankName; // Optional as per ERD discussion but we added it implied
    private BigDecimal balance;
    private String currencyCode;
    private BankAccountType type;
}
