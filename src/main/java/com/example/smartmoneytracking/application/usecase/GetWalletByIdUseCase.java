package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.WalletResponse;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetWalletByIdUseCase {

    private final WalletRepository walletRepository;

    @Transactional(readOnly = true)
    public WalletResponse execute(String walletId, String userId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to wallet");
        }

        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .name(wallet.getName())
                .balance(wallet.getBalance())
                .currencyCode(wallet.getCurrency().getCode())
                .currencySymbol(wallet.getCurrency().getSymbol())
                .type(wallet.getWalletType())
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
