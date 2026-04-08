package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = new ArrayList<>();
        categoryRepository.findAll().forEach(categories::add);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
