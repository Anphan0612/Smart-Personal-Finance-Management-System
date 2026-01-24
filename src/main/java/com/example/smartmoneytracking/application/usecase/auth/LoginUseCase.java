package com.example.smartmoneytracking.application.usecase.auth;

import com.example.smartmoneytracking.application.dto.AuthenticationResponse;
import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.entities.user.exceptions.InvalidCredentialsException;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import com.example.smartmoneytracking.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationResponse execute(String phone, String password) {

        // Find user by phone
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid phone or password"));

        // Check if user is enabled
        if (!user.isActive()) {
            throw new InvalidCredentialsException("Account is disabled");
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getName());
    }
}
