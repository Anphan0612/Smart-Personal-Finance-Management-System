package com.example.smartmoneytracking.domain.entities.wallet;

import com.example.smartmoneytracking.domain.entities.wallet.valueobject.*;

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
public class Wallet {

    private Long id;
    private Long userId;
    private String name;
    private BigDecimal balance;
    private Currency currency;
    private WalletType walletType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}