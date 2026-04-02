package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.AuthenticationResponse;
import com.example.smartmoneytracking.application.dto.LoginRequest;
import com.example.smartmoneytracking.application.dto.RegisterRequest;
import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.usecase.auth.LoginUseCase;
import com.example.smartmoneytracking.application.usecase.auth.RefreshTokenUseCase;
import com.example.smartmoneytracking.application.usecase.auth.RegisterUserUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        registerUserUseCase.execute(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getCccd());

        // Auto-login after registration
        AuthenticationResponse response = loginUseCase.execute(
                request.getUsername(),
                request.getPassword());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthenticationResponse response = loginUseCase.execute(
                request.getUsername(),
                request.getPassword());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(
            @RequestHeader("Refresh-Token") String token) {

        AuthenticationResponse response = refreshTokenUseCase.execute(token);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
