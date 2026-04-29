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
public class AtelierChatRequest {

    @NotBlank(message = "Message must not be empty")
    private String message;

    @NotBlank(message = "Wallet ID must not be empty")
    private String walletId;
}
