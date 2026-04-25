package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardResponseDTO;

public interface DashboardUseCase {
    DashboardResponseDTO getDashboardSummary(String walletId, String timeRange, String userId);
}
