package com.example.smartmoneytracking.interfaces.rest;

import com.example.smartmoneytracking.application.dto.AuthenticationResponse;
import com.example.smartmoneytracking.application.dto.LoginRequest;
import com.example.smartmoneytracking.application.dto.RegisterRequest;
import com.example.smartmoneytracking.application.usecase.auth.LoginUseCase;
import com.example.smartmoneytracking.application.usecase.auth.RegisterUserUseCase;
import com.example.smartmoneytracking.domain.entities.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUseCase loginUseCase;

    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?>
    register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = registerUserUseCase.execute(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getPhone(),
                    request.getCccd());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new RegisterResponse(user.getId(), "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Login user and get JWT tokens
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthenticationResponse response = loginUseCase.execute(
                    request.getPhone(),
                    request.getPassword());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Response DTOs
    record RegisterResponse(String userId, String message) {
    }

    record ErrorResponse(String error) {
    }
}
