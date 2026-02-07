package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.domain.entities.bankaccount.BankAccount;
import com.example.smartmoneytracking.domain.repositories.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeleteBankAccountUseCase {

    private final BankAccountRepository bankAccountRepository;

    @Transactional
    public void execute(String id, String userId) {
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bank Account not found"));

        if (!bankAccount.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized deletion of bank account");
        }

        bankAccountRepository.deleteById(id);
    }
}
