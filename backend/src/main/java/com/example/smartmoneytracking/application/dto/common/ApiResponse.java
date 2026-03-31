package com.example.smartmoneytracking.application.dto.common;

import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private int code;
    private String message;

    // Success
    private T data;

    // Error
    private String errorCode;
    private String traceId;
    private String path;
    private String suggestion;
    private List<FieldError> fieldErrors;

    // Common
    private Instant timestamp;

    // ─── Success Factories ───

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message("Operation successful")
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(201)
                .message("Resource created successfully")
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    // ─── Error Factories ───

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message,
                                           String path, String traceId) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(errorCode.getHttpStatus())
                .errorCode(errorCode.name())
                .message(message)
                .path(path)
                .traceId(traceId)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message,
                                           String path, String traceId,
                                           List<FieldError> fieldErrors) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(errorCode.getHttpStatus())
                .errorCode(errorCode.name())
                .message(message)
                .path(path)
                .traceId(traceId)
                .fieldErrors(fieldErrors)
                .timestamp(Instant.now())
                .build();
    }

    // ─── Nested Types ───

    @Data
    @Builder
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
    }
}
