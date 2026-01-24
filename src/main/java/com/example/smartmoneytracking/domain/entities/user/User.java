package com.example.smartmoneytracking.domain.entities.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    private Long id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Business logic methods

    /**
     * Validate email format
     */
    public boolean isValidEmail() {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    /**
     * Check if user account is active
     */
    public boolean isActive() {
        return isEnabled;
    }

    /**
     * Activate user account
     */
    public void activate() {
        this.isEnabled = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Deactivate user account
     */
    public void deactivate() {
        this.isEnabled = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Factory method to create new user
     */
    public static User create(String name, String email, String encodedPassword, String phone) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setPhone(phone);
        user.setEnabled(true); // Active by default
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }
}
