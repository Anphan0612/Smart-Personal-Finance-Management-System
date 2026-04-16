package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
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
public class WalletRequest {

    @NotBlank(message = "Wallet name is required")
    private String name;

    @NotNull(message = "Initial balance is required")
    @PositiveOrZero(message = "Balance must be zero or positive")
    private BigDecimal balance;

    @NotBlank(message = "Currency code is required")
    private String currencyCode; // We receive code, map to Currency

    @NotNull(message = "Wallet type is required")
    private WalletType type;

    private String bankName;
    private String accountNumber;
    private String branch;
}
