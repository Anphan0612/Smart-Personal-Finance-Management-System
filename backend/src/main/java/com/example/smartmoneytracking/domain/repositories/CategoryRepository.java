package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.category.Category;

import java.util.Optional;

public interface CategoryRepository {

    Category save(Category category);

    Optional<Category> findById(String id);
}
