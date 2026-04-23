package com.example.smartmoneytracking.domain.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "user_role")
    @Enumerated(EnumType.ORDINAL)
    private UserRole role;

    private String avatar;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    private String cccd;
    @Column(name = "is_enabled", nullable = false)
    private Boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_currency")
    private com.example.smartmoneytracking.domain.entities.common.CurrencyUnit preferredCurrency = com.example.smartmoneytracking.domain.entities.common.CurrencyUnit.USD;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum UserRole {
        USER,
        ADMIN
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
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
     * Activate user account
     */
    public void activate() {
        this.enabled = true;
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * Deactivate user account
     */
    public void deactivate() {
        this.enabled = false;
        this.updatedAt = OffsetDateTime.now();
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
        user.setRole(UserRole.USER);
        user.setPhone(phone);
        user.setCccd(cccd);
        user.setEnabled(true); // Active by default
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());
        return user;
    }
}
