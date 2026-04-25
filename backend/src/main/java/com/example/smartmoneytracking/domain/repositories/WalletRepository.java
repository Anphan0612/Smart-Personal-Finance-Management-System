package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.wallet.Wallet;

import java.util.List;
import java.util.Optional;

public interface WalletRepository {
    Wallet save(Wallet wallet);

    Optional<Wallet> findById(String id);
    Optional<Wallet> findByIdAndUserId(String id, String userId);
    List<Wallet> findByUserId(String userId);

    void deleteById(String id);
}
