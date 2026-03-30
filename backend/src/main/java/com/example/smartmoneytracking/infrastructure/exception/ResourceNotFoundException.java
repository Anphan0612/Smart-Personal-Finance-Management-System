package com.example.smartmoneytracking.infrastructure.exception;

import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException() {
        super(ErrorCode.RESOURCE_NOT_FOUND);
    }

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }
}
