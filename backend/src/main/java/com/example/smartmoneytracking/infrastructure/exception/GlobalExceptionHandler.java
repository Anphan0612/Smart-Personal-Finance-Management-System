package com.example.smartmoneytracking.infrastructure.exception;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.infrastructure.ai.NlpExtractionException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        String path = request.getRequestURI();
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        List<ApiResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> ApiResponse.FieldError.builder()
                        .field(error.getField())
                        .message(error.getDefaultMessage())
                        .build())
                .toList();

        log.warn("[traceId={}, path={}, errorCode={}] Validation failed: {} field error(s)",
                traceId, path, errorCode, fieldErrors.size());

        return buildResponse(errorCode, errorCode.getDefaultMessage(), path, traceId, fieldErrors);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        String path = request.getRequestURI();
        ErrorCode errorCode = ex.getErrorCode();

        log.warn("[traceId={}, path={}, errorCode={}] Business error: {}",
                traceId, path, errorCode, ex.getMessage());

        return buildResponse(errorCode, ex.getMessage(), path, traceId, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        String path = request.getRequestURI();
        ErrorCode errorCode = ErrorCode.JSON_PARSE_ERROR;

        // Custom message for empty body vs malformed JSON
        String message = errorCode.getDefaultMessage();
        if (ex.getMessage() != null && ex.getMessage().contains("Required request body is missing")) {
            message = "Required request body is missing";
        }

        log.warn("[traceId={}, path={}, errorCode={}] JSON parse error: {}", traceId, path, errorCode, ex.getMessage());

        return buildResponse(errorCode, message, path, traceId, null);
    }

    @ExceptionHandler(NlpExtractionException.class)
    public ResponseEntity<ApiResponse<Void>> handleNlpExtractionException(
            NlpExtractionException ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        String path = request.getRequestURI();
        ErrorCode errorCode = ErrorCode.NLP_EXTRACTION_ERROR;

        log.warn("[traceId={}, path={}, errorCode={}] NLP error: {}",
                traceId, path, errorCode, ex.getMessage());

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(errorCode.getHttpStatus())
                .errorCode(errorCode.name())
                .message(ex.getMessage())
                .path(path)
                .traceId(traceId)
                .suggestion(ex.getSuggestion())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFoundException(
            jakarta.persistence.EntityNotFoundException ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        String path = request.getRequestURI();
        ErrorCode errorCode = ErrorCode.RESOURCE_NOT_FOUND;

        log.warn("[traceId={}, path={}, errorCode={}] Entity not found: {}",
                traceId, path, errorCode, ex.getMessage());

        return buildResponse(errorCode, ex.getMessage(), path, traceId, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        String path = request.getRequestURI();
        ErrorCode errorCode = ErrorCode.INTERNAL_ERROR;

        log.error("[traceId={}, path={}, errorCode={}] Unexpected error: {}",
                traceId, path, errorCode, ex.getMessage(), ex);

        return buildResponse(errorCode, errorCode.getDefaultMessage(), path, traceId, null);
    }

    private ResponseEntity<ApiResponse<Void>> buildResponse(
            ErrorCode errorCode, String message, String path,
            String traceId, List<ApiResponse.FieldError> fieldErrors) {

        ApiResponse<Void> response = ApiResponse.error(
                errorCode, message, path, traceId, fieldErrors);

        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    private String generateTraceId() {
        return UUID.randomUUID().toString();
    }
}
