package com.example.smartmoneytracking.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtelierChatResponse {

    private String message;
    private Map<String, Object> data;
    private String type;
}
