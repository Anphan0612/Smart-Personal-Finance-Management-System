package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.category.Category;

public interface CategoryRepository
{
    Category save(Category category);
}
