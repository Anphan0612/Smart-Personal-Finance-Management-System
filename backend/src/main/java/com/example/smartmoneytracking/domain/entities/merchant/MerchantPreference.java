package com.example.smartmoneytracking.domain.entities.merchant;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "merchant_preferences")
public class MerchantPreference {
    @Id
    @Setter(AccessLevel.PRIVATE)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "normalized_pattern", nullable = false)
    private String normalizedPattern; // Normalized name (lowercase, no accents)

    @Column(name = "category_id", nullable = false)
    private String categoryId;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (lastUsedAt == null) lastUsedAt = LocalDateTime.now();
    }

    public static MerchantPreference create(String userId, String normalizedPattern, String categoryId) {
        MerchantPreference pref = new MerchantPreference();
        pref.userId = userId;
        pref.normalizedPattern = normalizedPattern;
        pref.categoryId = categoryId;
        pref.lastUsedAt = LocalDateTime.now();
        return pref;
    }

    public void updateCategory(String categoryId) {
        this.categoryId = categoryId;
        this.lastUsedAt = LocalDateTime.now();
    }

    public void markUsed() {
        this.lastUsedAt = LocalDateTime.now();
    }
}
