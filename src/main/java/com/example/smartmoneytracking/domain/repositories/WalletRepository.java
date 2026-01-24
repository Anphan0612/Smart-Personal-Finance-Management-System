package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.wallet.Wallet;

public interface WalletRepository {
    Wallet save(Wallet wallet);
}
