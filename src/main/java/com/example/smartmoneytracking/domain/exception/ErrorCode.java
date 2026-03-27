package com.example.smartmoneytracking.domain.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Validation
    VALIDATION_ERROR(400, "Validation failed"),

    // Business Rules
    BUSINESS_RULE_VIOLATION(422, "Business rule violation"),
    TRANSACTION_DATE_IN_FUTURE(422, "Transaction date cannot be in the future"),
    CATEGORY_NOT_FOUND(404, "Category not found"),
    WALLET_NOT_FOUND(404, "Wallet not found"),
    INSUFFICIENT_BALANCE(422, "Insufficient wallet balance"),

    // Auth
    INVALID_CREDENTIALS(401, "Invalid credentials"),
    USER_ALREADY_EXISTS(409, "User already exists"),
    USER_NOT_FOUND(404, "User not found"),
    UNAUTHORIZED_ACCESS(403, "Unauthorized access"),

    // Resource
    RESOURCE_NOT_FOUND(404, "Resource not found"),

    // System
    JSON_PARSE_ERROR(400, "Invalid JSON format"),
    INTERNAL_ERROR(500, "An unexpected error occurred"),
    NLP_EXTRACTION_ERROR(422, "NLP extraction failed");

    private final int httpStatus;
    private final String defaultMessage;
}
