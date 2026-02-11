package com.example.smartmoneytracking.domain.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String username;

    private UserRole role;

    private String avatar;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    private String cccd;
    private boolean isEnabled;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum UserRole {
        USER,
        ADMIN
    }
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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
    public static User create(String name, String email, String encodedPassword, String phone, String cccd) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(name);
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setPhone(phone);
        user.setCccd(cccd);
        user.setEnabled(true); // Active by default
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }
}
