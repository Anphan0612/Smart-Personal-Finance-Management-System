package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BankAccountRequest;
import com.example.smartmoneytracking.application.dto.BankAccountResponse;
import com.example.smartmoneytracking.domain.entities.bankaccount.BankAccount;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.repositories.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateBankAccountUseCase {

    private final BankAccountRepository bankAccountRepository;

    @Transactional
    public BankAccountResponse execute(BankAccountRequest request, String userId) {
        BankAccount account = BankAccount.create(
                userId,
                request.getAccountNumber(),
                request.getBankName(),
                request.getBalance(),
                new Currency(request.getCurrencyCode(), request.getCurrencyCode()),
                request.getType());
        // setCreatedAt handled by @PrePersist/onCreate

        BankAccount savedAccount = bankAccountRepository.save(account);

        return BankAccountResponse.builder()
                .id(savedAccount.getId())
                .userId(savedAccount.getUserId())
                .accountNumber(savedAccount.getAccountNumber())
                .balance(savedAccount.getBalance())
                .currencyCode(savedAccount.getCurrency().getCode())
                .type(savedAccount.getType())
                .createdAt(savedAccount.getCreatedAt())
                .build();
    }
}
