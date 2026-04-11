package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.receipt.Receipt;
import com.example.smartmoneytracking.domain.repositories.ReceiptRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JpaReceiptRepository extends JpaRepository<Receipt, String>, ReceiptRepository {
    List<Receipt> findByUserId(String userId);
}
