package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
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
    private String name;
    private BigDecimal balance;
    private String currencyCode; // We receive code, map to Currency
    private WalletType type;
}
