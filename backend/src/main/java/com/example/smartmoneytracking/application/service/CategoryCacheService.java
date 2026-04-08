package com.example.smartmoneytracking.application.service;

import com.example.smartmoneytracking.domain.entities.category.Category;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CategoryCacheService {

    private final CategoryRepository categoryRepository;

    @Cacheable(value = "nlpLabels", key = "#nlpLabel", unless = "#result == null")
    public String getCategoryIdByNlpLabel(String nlpLabel) {
        log.info("[CACHE] Fetching category ID for NLP label: {}", nlpLabel);
        return categoryRepository.findByNlpLabel(nlpLabel)
                .map(Category::getId)
                .orElse(null);
    }

    @CacheEvict(value = "nlpLabels", allEntries = true)
    public void evictCategoryCache() {
        log.info("[CACHE] Evicting all NLP label mappings");
    }
}
