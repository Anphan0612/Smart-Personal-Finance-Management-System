package com.example.smartmoneytracking.domain.entities.category;

import com.example.smartmoneytracking.domain.entities.category.valueobject.Type;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @Setter(AccessLevel.PRIVATE)
    private String id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "icon_name", nullable = false)
    private com.example.smartmoneytracking.domain.entities.common.MaterialSymbol iconName = com.example.smartmoneytracking.domain.entities.common.MaterialSymbol.LIST;

    @Setter
    @Column(name = "nlp_label", length = 50)
    private String nlpLabel;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = java.util.UUID.randomUUID().toString();
        if (createdAt == null)
            createdAt = LocalDateTime.now();
    }

    // Business Methods
    public void updateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        this.name = name;
    }

    public void updateType(Type type) {
        if (type == null)
            throw new IllegalArgumentException("Type cannot be null");
        this.type = type;
    }

    public static Category create(String name, Type type) {
        Category category = new Category();
        category.updateName(name);
        category.updateType(type);
        return category;
    }
}
