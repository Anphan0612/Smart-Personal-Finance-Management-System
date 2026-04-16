package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
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
public class WalletUpdateRequest {

    private String name;

    @PositiveOrZero(message = "Balance must be zero or positive")
    private BigDecimal balance;

    private String currencyCode;
    private WalletType type;
    private String bankName;
    private String accountNumber;
    private String branch;
}
