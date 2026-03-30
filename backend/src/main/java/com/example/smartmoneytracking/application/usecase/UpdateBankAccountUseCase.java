package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BankAccountResponse;
import com.example.smartmoneytracking.application.dto.BankAccountUpdateRequest;
import com.example.smartmoneytracking.domain.entities.bankaccount.BankAccount;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.repositories.BankAccountRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateBankAccountUseCase {

    private final BankAccountRepository bankAccountRepository;

    @Transactional
    public BankAccountResponse execute(String id, BankAccountUpdateRequest request, String userId) {
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank Account not found"));

        if (!bankAccount.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized update of bank account");
        }

        if (request.getAccountNumber() != null || request.getBankName() != null || request.getType() != null) {
            bankAccount.updateDetails(request.getAccountNumber(), request.getBankName(), request.getType());
        }

        if (request.getBalance() != null) {
            bankAccount.reviseBalance(request.getBalance());
        }
        if (request.getCurrencyCode() != null) {
            bankAccount.setCurrency(new Currency(request.getCurrencyCode(), request.getCurrencyCode()));
        }
        // bankAccount.setUpdatedAt(LocalDateTime.now()); handled by @PreUpdate

        BankAccount savedBankAccount = bankAccountRepository.save(bankAccount);

        return BankAccountResponse.builder()
                .id(savedBankAccount.getId())
                .userId(savedBankAccount.getUserId())
                .accountNumber(savedBankAccount.getAccountNumber())
                .bankName(savedBankAccount.getBankName())
                .balance(savedBankAccount.getBalance())
                .currencyCode(savedBankAccount.getCurrency().getCode())
                .currencySymbol(savedBankAccount.getCurrency().getSymbol())
                .type(savedBankAccount.getType())
                .createdAt(savedBankAccount.getCreatedAt())
                .build();
    }
}
