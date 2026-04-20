package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.receipt.Receipt;
import java.util.List;
import java.util.Optional;

public interface ReceiptRepository {
    Receipt save(Receipt receipt);
    Optional<Receipt> findById(String id);
    List<Receipt> findByUserId(String userId);
    void deleteById(String id);
}
