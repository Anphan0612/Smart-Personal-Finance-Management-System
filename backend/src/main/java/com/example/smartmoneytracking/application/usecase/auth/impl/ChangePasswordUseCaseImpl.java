package com.example.smartmoneytracking.application.usecase.auth.impl;

import com.example.smartmoneytracking.application.usecase.auth.ChangePasswordUseCase;
import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.entities.user.exceptions.UserNotFoundException;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChangePasswordUseCaseImpl implements ChangePasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void execute(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // 1. Check current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu hiện tại không chính xác");
        }

        // 2. Encode and update new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
