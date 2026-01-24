package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.transaction.Transaction;

public interface TransactionRepository {
    Transaction save(Transaction transaction);
}
