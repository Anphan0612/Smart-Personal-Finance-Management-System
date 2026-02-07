package com.example.smartmoneytracking.infrastructure.exception;

import com.example.smartmoneytracking.application.dto.common.CommonApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
                CommonApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Validation failed", errors));
    }

    // You can add more specific exception handlers here (e.g.,
    // EntityNotFoundException)
    // For now, let's add a generic one

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(CommonApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonApiResponse<Void>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                CommonApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "An unexpected error occurred: " + ex.getMessage()));
    }

    // Add EntityNotFoundException handler if you have a custom exception for it
    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleEntityNotFoundException(
            jakarta.persistence.EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                CommonApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }
}
