package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.WalletResponse;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetWalletsByUserIdUseCase {

    private final WalletRepository walletRepository;

    @Transactional(readOnly = true)
    public List<WalletResponse> execute(String userId) {
        return walletRepository.findByUserId(userId).stream()
                .map(wallet -> WalletResponse.builder()
                        .id(wallet.getId())
                        .userId(wallet.getUserId())
                        .name(wallet.getName())
                        .balance(wallet.getBalance())
                        .currencyCode(wallet.getCurrency().getCode())
                        .currencySymbol(wallet.getCurrency().getSymbol())
                        .type(wallet.getWalletType())
                        .bankName(wallet.getBankName())
                        .accountNumber(wallet.getAccountNumber())
                        .branch(wallet.getBranch())
                        .createdAt(wallet.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
