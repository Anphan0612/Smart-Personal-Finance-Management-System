package com.example.smartmoneytracking.application.dto;

import com.example.smartmoneytracking.domain.entities.category.valueobject.Type;
import com.example.smartmoneytracking.domain.entities.common.MaterialSymbol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryResponse {
    private String id;
    private String name;
    private Type type;
    private MaterialSymbol iconName;
    private String nlpLabel;
    private String color;
}
