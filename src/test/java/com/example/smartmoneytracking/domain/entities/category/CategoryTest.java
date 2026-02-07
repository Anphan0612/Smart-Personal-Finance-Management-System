package com.example.smartmoneytracking.domain.entities.category;

import com.example.smartmoneytracking.domain.entities.category.valueobject.Type;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CategoryTest {

    @Test
    void shouldCreateCategorySuccessfully() {
        Category category = Category.create("Food", Type.EXPENSE);

        assertNotNull(category);
        assertEquals("Food", category.getName());
        assertEquals(Type.EXPENSE, category.getType());
    }

    @Test
    void shouldUpdateNameSuccessfully() {
        Category category = Category.create("Food", Type.EXPENSE);
        category.updateName("Dining");

        assertEquals("Dining", category.getName());
    }

    @Test
    void shouldThrowExceptionWhenNameIsEmpty() {
        Category category = Category.create("Food", Type.EXPENSE);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            category.updateName("");
        });

        assertEquals("Category name cannot be empty", exception.getMessage());
    }
}
