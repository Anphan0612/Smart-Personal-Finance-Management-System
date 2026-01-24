package com.example.smartmoneytracking.domain.entities.category;

import com.example.smartmoneytracking.domain.entities.category.valueobject.Type;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Category {
    private Long id;
    private String name;
    private Type type;
    private LocalDateTime createdAt;
}
