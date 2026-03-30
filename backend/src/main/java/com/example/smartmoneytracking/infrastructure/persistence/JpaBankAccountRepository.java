package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.bankaccount.BankAccount;
import com.example.smartmoneytracking.domain.repositories.BankAccountRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaBankAccountRepository extends JpaRepository<BankAccount, String>, BankAccountRepository {
}
