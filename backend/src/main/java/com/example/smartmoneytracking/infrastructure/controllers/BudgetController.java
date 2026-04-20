package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.dto.BudgetRequest;
import com.example.smartmoneytracking.application.dto.BudgetResponse;
import com.example.smartmoneytracking.application.dto.BudgetPlanningResponse;
import com.example.smartmoneytracking.application.usecase.GetBudgetPlanningUseCase;
import com.example.smartmoneytracking.application.usecase.GetBudgetSummaryUseCase;
import com.example.smartmoneytracking.application.usecase.ResetBudgetUseCase;
import com.example.smartmoneytracking.application.usecase.UpsertBudgetUseCase;
import com.example.smartmoneytracking.domain.entities.budget.Budget;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final UpsertBudgetUseCase upsertBudgetUseCase;
    private final GetBudgetSummaryUseCase getBudgetSummaryUseCase;
    private final GetBudgetPlanningUseCase getBudgetPlanningUseCase;
    private final ResetBudgetUseCase resetBudgetUseCase;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<com.example.smartmoneytracking.application.dto.common.ApiResponse<Budget>> upsertBudget(@RequestBody BudgetRequest request) {
        System.out.println("DEBUG: Received BudgetRequest: " + request);
        String userId = securityUtils.getCurrentUserId();
        Budget budget = upsertBudgetUseCase.execute(userId, request.getCategoryId(), request.getAmount(), request.getMonth(), request.getYear());
        return ResponseEntity.ok(com.example.smartmoneytracking.application.dto.common.ApiResponse.success(budget));
    }

    @GetMapping
    public ResponseEntity<com.example.smartmoneytracking.application.dto.common.ApiResponse<List<BudgetResponse>>> getBudgetSummary(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        String userId = securityUtils.getCurrentUserId();
        List<BudgetResponse> summary = getBudgetSummaryUseCase.execute(userId, month, year);
        return ResponseEntity.ok(com.example.smartmoneytracking.application.dto.common.ApiResponse.success(summary));
    }

    @GetMapping("/planning")
    public ResponseEntity<com.example.smartmoneytracking.application.dto.common.ApiResponse<BudgetPlanningResponse>> getBudgetPlanning(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        String userId = securityUtils.getCurrentUserId();
        BudgetPlanningResponse planning = getBudgetPlanningUseCase.execute(userId, month, year);
        return ResponseEntity.ok(com.example.smartmoneytracking.application.dto.common.ApiResponse.success(planning));
    }

    @DeleteMapping("/reset")
    public ResponseEntity<com.example.smartmoneytracking.application.dto.common.ApiResponse<Void>> resetBudgets(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        String userId = securityUtils.getCurrentUserId();
        resetBudgetUseCase.execute(userId, month, year);
        return ResponseEntity.ok(com.example.smartmoneytracking.application.dto.common.ApiResponse.success(null));
    }
}
