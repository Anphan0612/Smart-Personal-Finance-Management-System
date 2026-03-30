package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.dashboard.response.DashboardResponseDTO;
import com.example.smartmoneytracking.application.usecase.DashboardUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardUseCase dashboardUseCase;

    @GetMapping("/summary")
    public ResponseEntity<DashboardResponseDTO> getDashboardSummary(
            @RequestParam String walletId,
            @RequestParam(defaultValue = "current_month") String timeRange) {
        
        DashboardResponseDTO response = dashboardUseCase.getDashboardSummary(walletId, timeRange);
        return ResponseEntity.ok(response);
    }
}
