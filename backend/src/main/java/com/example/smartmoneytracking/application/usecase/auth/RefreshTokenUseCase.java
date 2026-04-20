package com.example.smartmoneytracking.application.usecase.auth;

import com.example.smartmoneytracking.application.dto.AuthenticationResponse;
import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.entities.user.exceptions.InvalidCredentialsException;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import com.example.smartmoneytracking.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationResponse execute(String refreshToken) {
        // Validate refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid refresh token");
        }

        // Get user ID from token
        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new InvalidCredentialsException("Account is disabled");
        }

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        return new AuthenticationResponse(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getEmail(),
                user.getUsername());
    }
}
