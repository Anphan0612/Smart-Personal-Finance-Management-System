package com.example.smartmoneytracking.application.usecase.auth;

import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.entities.user.exceptions.UserAlreadyExistsException;
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

    @Transactional
    public User execute(String name, String email, String rawPassword, String phone) {

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("User with email " + email + " already exists");
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Create user using factory method
        User user = User.create(name, email, encodedPassword, phone);

        // Validate email format
        if (!user.isValidEmail()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Save and return
        return userRepository.save(user);
    }
}
