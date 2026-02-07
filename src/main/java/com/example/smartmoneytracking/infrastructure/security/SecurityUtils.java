package com.example.smartmoneytracking.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public String getCurrentUserId() {
        // TEMPORARY: Hardcoded user ID for testing CRUD without auth
        return "test-user-id";
        // return authentication.getName();
    }
}
