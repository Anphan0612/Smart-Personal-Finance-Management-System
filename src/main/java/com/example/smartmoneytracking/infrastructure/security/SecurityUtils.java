package com.example.smartmoneytracking.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Utility class for accessing security context and current user information
 */
@Service
public class SecurityUtils {

    /**
     * Get the current authenticated user's ID from the security context
     * 
     * @return User ID of the currently authenticated user
     * @throws RuntimeException if no user is authenticated
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUserId();
        }

        throw new RuntimeException("Unable to get user ID from authentication");
    }

    /**
     * Get the current authenticated user's principal
     * 
     * @return UserPrincipal of the currently authenticated user
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }

        throw new RuntimeException("Unable to get user principal from authentication");
    }
}
