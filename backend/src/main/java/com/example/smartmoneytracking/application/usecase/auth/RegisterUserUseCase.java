package com.example.smartmoneytracking.application.usecase.auth;

import com.example.smartmoneytracking.application.dto.WalletRequest;
import com.example.smartmoneytracking.application.usecase.CreateWalletUseCase;
import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.entities.user.exceptions.UserAlreadyExistsException;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CreateWalletUseCase createWalletUseCase;

    @Transactional
    public User execute(String name, String email, String rawPassword, String phone, String cccd) {

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("User with email " + email + " already exists");
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Create user using factory method
        User user = User.create(name, email, encodedPassword, phone, cccd);

        // Validate email format
        if (!user.isValidEmail()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Save and return
        User savedUser = userRepository.save(user);

        // Auto-initialize Default Wallet
        createDefaultWallet(savedUser.getId());

        return savedUser;
    }

    private void createDefaultWallet(String userId) {
        WalletRequest walletRequest = WalletRequest.builder()
                .name("Ví chính")
                .balance(java.math.BigDecimal.ZERO)
                .currencyCode("VND")
                .type(WalletType.CASH)
                .build();
        createWalletUseCase.execute(walletRequest, userId);
    }
}
