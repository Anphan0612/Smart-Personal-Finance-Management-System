package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.ChangePasswordRequest;
import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.usecase.auth.ChangePasswordUseCase;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final ChangePasswordUseCase changePasswordUseCase;
    private final SecurityUtils securityUtils;

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String userId = securityUtils.getCurrentUserId();
        log.info("[USER] Request to change password for user: {}", userId);
        
        changePasswordUseCase.execute(userId, request.getCurrentPassword(), request.getNewPassword());
        
        log.info("[USER] Password changed successfully for user: {}", userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Thay đổi mật khẩu thành công"));
    }
}
