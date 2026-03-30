package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.bankaccount.BankAccount;

import java.util.List;
import java.util.Optional;

public interface BankAccountRepository {
    BankAccount save(BankAccount bankAccount);

    Optional<BankAccount> findById(String id);

    List<BankAccount> findByUserId(String userId);

    void deleteById(String id);
}
