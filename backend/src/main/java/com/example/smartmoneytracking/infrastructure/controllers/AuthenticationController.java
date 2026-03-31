package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.AuthenticationResponse;
import com.example.smartmoneytracking.application.dto.LoginRequest;
import com.example.smartmoneytracking.application.dto.RegisterRequest;
import com.example.smartmoneytracking.application.dto.common.ApiResponse;
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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResult>> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = registerUserUseCase.execute(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getCccd());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(new RegisterResult(user.getId())));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthenticationResponse response = loginUseCase.execute(
                request.getUsername(),
                request.getPassword());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    public record RegisterResult(String userId) {}
}
