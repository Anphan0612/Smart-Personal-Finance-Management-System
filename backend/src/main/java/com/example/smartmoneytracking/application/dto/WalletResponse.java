package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
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
public class WalletResponse {
    private String id;
    private String userId;
    private String name;
    private BigDecimal balance;
    private String currencyCode;
    private String currencySymbol;
    private WalletType type; // or String displayName
    private LocalDateTime createdAt;
}
