package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.WalletRequest;
import com.example.smartmoneytracking.application.dto.WalletResponse;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateWalletUseCase {

    private final WalletRepository walletRepository;

    @Transactional
    public WalletResponse execute(WalletRequest request, String userId) {
        // Map Request to Entity
        Wallet wallet = Wallet.create(
                userId,
                request.getName(),
                new Currency(request.getCurrencyCode(), request.getCurrencyCode()),
                request.getType(),
                request.getBalance()
        );

        // Removed unnecessary manual timestamp setting as @PrePersist/onCreate handles
        // it

        // Save
        Wallet savedWallet = walletRepository.save(wallet);

        // Map Entity to Response
        return WalletResponse.builder()
                .id(savedWallet.getId())
                .userId(savedWallet.getUserId())
                .name(savedWallet.getName())
                .balance(savedWallet.getBalance())
                .currencyCode(savedWallet.getCurrency().getCode())
                .currencySymbol(savedWallet.getCurrency().getSymbol())
                .type(savedWallet.getWalletType())
                .createdAt(savedWallet.getCreatedAt())
                .build();
    }
}
