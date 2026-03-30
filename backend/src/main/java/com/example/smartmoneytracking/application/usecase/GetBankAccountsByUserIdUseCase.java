package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.BankAccountResponse;
import com.example.smartmoneytracking.domain.repositories.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetBankAccountsByUserIdUseCase {

    private final BankAccountRepository bankAccountRepository;

    @Transactional(readOnly = true)
    public List<BankAccountResponse> execute(String userId) {
        return bankAccountRepository.findByUserId(userId).stream()
                .map(account -> BankAccountResponse.builder()
                        .id(account.getId())
                        .userId(account.getUserId())
                        .accountNumber(account.getAccountNumber())
                        .balance(account.getBalance())
                        .currencyCode(account.getCurrency().getCode())
                        .type(account.getType())
                        .createdAt(account.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
