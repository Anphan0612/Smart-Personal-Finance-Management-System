package com.example.smartmoneytracking.infrastructure.security;

import com.example.smartmoneytracking.infrastructure.exception.UnauthorizedException;
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
     * @throws UnauthorizedException if no user is authenticated or principal is invalid
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUserId();
        }

        throw new UnauthorizedException("Unable to get user ID from authentication");
    }

    /**
     * Get the current authenticated user's principal
     *
     * @return UserPrincipal of the currently authenticated user
     * @throws UnauthorizedException if no user is authenticated or principal is invalid
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }

        throw new UnauthorizedException("Unable to get user principal from authentication");
    }
}
