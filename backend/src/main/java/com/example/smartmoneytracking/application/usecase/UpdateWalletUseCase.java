package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.WalletResponse;
import com.example.smartmoneytracking.application.dto.WalletUpdateRequest;
import com.example.smartmoneytracking.domain.entities.wallet.Wallet;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.Currency;
import com.example.smartmoneytracking.domain.repositories.WalletRepository;
import com.example.smartmoneytracking.infrastructure.exception.ResourceNotFoundException;
import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateWalletUseCase {

    private final WalletRepository walletRepository;

    @Transactional
    public WalletResponse execute(String walletId, WalletUpdateRequest request, String userId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized update of wallet");
        }

        if (request.getName() != null) {
            wallet.updateName(request.getName());
        }
        if (request.getBalance() != null) {
            wallet.reviseBalance(request.getBalance());
        }
        if (request.getCurrencyCode() != null) {
            wallet.setCurrency(new Currency(request.getCurrencyCode(), request.getCurrencyCode()));
        }
        if (request.getType() != null) {
            wallet.setWalletType(request.getType());
        }
        if (request.getBankName() != null || request.getAccountNumber() != null || request.getBranch() != null) {
            wallet.updateBankDetails(request.getBankName(), request.getAccountNumber(), request.getBranch());
        }
        // wallet.setUpdatedAt(OffsetDateTime.now()); handled by @PreUpdate

        Wallet savedWallet = walletRepository.save(wallet);

        return WalletResponse.builder()
                .id(savedWallet.getId())
                .userId(savedWallet.getUserId())
                .name(savedWallet.getName())
                .balance(savedWallet.getBalance())
                .currencyCode(savedWallet.getCurrency().getCode())
                .currencySymbol(savedWallet.getCurrency().getSymbol())
                .type(savedWallet.getWalletType())
                .bankName(savedWallet.getBankName())
                .accountNumber(savedWallet.getAccountNumber())
                .branch(savedWallet.getBranch())
                .createdAt(savedWallet.getCreatedAt())
                .updatedAt(savedWallet.getUpdatedAt())
                .build();
    }
}
