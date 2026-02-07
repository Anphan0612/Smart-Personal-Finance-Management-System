package com.example.smartmoneytracking.application.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommonApiResponse<T> {
    private boolean success;
    private int code;
    private String message;
    private T payload;
    private List<String> errors;
    private long timestamp;

    public static <T> CommonApiResponse<T> success(T payload) {
        return CommonApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message("Operation successful")
                .payload(payload)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static <T> CommonApiResponse<T> created(T payload) {
        return CommonApiResponse.<T>builder()
                .success(true)
                .code(201)
                .message("Resource created successfully")
                .payload(payload)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static <T> CommonApiResponse<T> error(int code, String message) {
        return CommonApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static <T> CommonApiResponse<T> error(int code, String message, List<String> errors) {
        return CommonApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .errors(errors)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
