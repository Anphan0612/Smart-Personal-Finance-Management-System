package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.bankaccount.valueobject.BankAccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Bank name is required")
    private String bankName; // Optional as per ERD discussion but we added it implied

    @NotNull(message = "Balance is required")
    @PositiveOrZero(message = "Balance must be zero or positive")
    private BigDecimal balance;

    @NotBlank(message = "Currency code is required")
    private String currencyCode;

    @NotNull(message = "Bank account type is required")
    private BankAccountType type;
}
