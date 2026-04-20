package com.example.smartmoneytracking.infrastructure.ai;

public class NlpExtractionException extends RuntimeException {
    private final String errorCode;
    private final String suggestion;

    public NlpExtractionException(String message, String errorCode, String suggestion) {
        super(message);
        this.errorCode = errorCode;
        this.suggestion = suggestion;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getSuggestion() {
        return suggestion;
    }
}

