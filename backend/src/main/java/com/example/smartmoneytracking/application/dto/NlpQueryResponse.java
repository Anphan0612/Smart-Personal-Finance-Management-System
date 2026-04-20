package com.example.smartmoneytracking.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NlpQueryResponse {

    private String intent; // "QUERY" or "COMMAND"
    private Map<String, Object> filters;
    private String answer;
    private Map<String, Object> summary;
    private List<TransactionResponse> matchedTransactions;
}
