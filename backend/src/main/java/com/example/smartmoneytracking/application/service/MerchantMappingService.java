package com.example.smartmoneytracking.application.service;

import com.example.smartmoneytracking.domain.entities.merchant.MerchantPreference;
import com.example.smartmoneytracking.domain.repositories.MerchantPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class MerchantMappingService {

    private final MerchantPreferenceRepository merchantPreferenceRepository;
    private final StringNormalizer stringNormalizer;

    /**
     * Attempts to find a preferred category ID for a given merchant name.
     */
    public Optional<String> findPreferredCategoryId(String userId, String merchantName) {
        if (merchantName == null || merchantName.isEmpty()) return Optional.empty();
        
        String normalized = stringNormalizer.normalize(merchantName);
        log.info("[MAPPING] Searching preference for normalized merchant: {}", normalized);
        
        return merchantPreferenceRepository.findBestMatch(userId, normalized)
                .map(pref -> {
                    log.info("[MAPPING] Found historical match for {}: Category ID {}", normalized, pref.getCategoryId());
                    pref.markUsed();
                    merchantPreferenceRepository.save(pref);
                    return pref.getCategoryId();
                });
    }

    /**
     * Learns or updates a preference when a user confirms a transaction.
     */
    @Transactional
    public void upsertPreference(String userId, String merchantName, String categoryId) {
        if (merchantName == null || merchantName.isEmpty() || categoryId == null) return;
        
        String normalized = stringNormalizer.normalize(merchantName);
        
        Optional<MerchantPreference> existing = merchantPreferenceRepository.findByUserIdAndNormalizedPattern(userId, normalized);
        
        if (existing.isPresent()) {
            MerchantPreference pref = existing.get();
            if (!pref.getCategoryId().equals(categoryId)) {
                log.info("[MAPPING] Updating preference: {} -> {}", normalized, categoryId);
                pref.updateCategory(categoryId);
                merchantPreferenceRepository.save(pref);
            }
        } else {
            log.info("[MAPPING] Creating new preference: {} -> {}", normalized, categoryId);
            MerchantPreference newPref = MerchantPreference.create(userId, normalized, categoryId);
            merchantPreferenceRepository.save(newPref);
        }
    }
}
