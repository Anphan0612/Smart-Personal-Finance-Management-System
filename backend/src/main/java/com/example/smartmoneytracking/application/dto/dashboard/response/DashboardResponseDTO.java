package com.example.smartmoneytracking.application.dto.dashboard.response;

import com.example.smartmoneytracking.application.dto.TransactionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponseDTO {
    private DashboardSummaryDTO summary;
    private List<MonthlyTrendDTO> monthlyTrend;
    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<TransactionResponse> transactions;
}
