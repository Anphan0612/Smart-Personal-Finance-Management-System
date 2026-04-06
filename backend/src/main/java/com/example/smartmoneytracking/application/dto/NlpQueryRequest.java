package com.example.smartmoneytracking.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NlpQueryRequest {

    @NotBlank(message = "Query text must not be empty")
    private String text;

    private String walletId;
}
