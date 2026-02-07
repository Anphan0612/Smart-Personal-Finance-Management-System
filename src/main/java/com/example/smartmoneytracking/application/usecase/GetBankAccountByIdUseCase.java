package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BankAccountResponse;
import com.example.smartmoneytracking.domain.entities.bankaccount.BankAccount;
import com.example.smartmoneytracking.domain.repositories.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetBankAccountByIdUseCase {

    private final BankAccountRepository bankAccountRepository;

    @Transactional(readOnly = true)
    public BankAccountResponse execute(String id, String userId) {
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bank Account not found"));

        if (!bankAccount.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to bank account");
        }

        return BankAccountResponse.builder()
                .id(bankAccount.getId())
                .userId(bankAccount.getUserId())
                .accountNumber(bankAccount.getAccountNumber())
                .bankName(bankAccount.getBankName())
                .balance(bankAccount.getBalance())
                .currencyCode(bankAccount.getCurrency().getCode())
                .currencySymbol(bankAccount.getCurrency().getSymbol())
                .type(bankAccount.getType())
                .createdAt(bankAccount.getCreatedAt())
                .build();
    }
}
