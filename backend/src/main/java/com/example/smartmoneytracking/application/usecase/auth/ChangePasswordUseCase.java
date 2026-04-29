package com.example.smartmoneytracking.application.usecase.auth;

public interface ChangePasswordUseCase {
    void execute(String userId, String currentPassword, String newPassword);
}
