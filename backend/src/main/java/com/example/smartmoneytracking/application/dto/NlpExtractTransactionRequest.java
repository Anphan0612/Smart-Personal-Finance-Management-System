package com.example.smartmoneytracking.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NlpExtractTransactionRequest {

    @NotBlank(message = "text is required")
    private String text;
}

