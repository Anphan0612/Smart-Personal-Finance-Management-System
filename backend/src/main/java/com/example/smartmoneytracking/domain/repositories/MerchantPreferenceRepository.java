package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.merchant.MerchantPreference;
import java.util.List;
import java.util.Optional;

public interface MerchantPreferenceRepository {
    MerchantPreference save(MerchantPreference preference);
    Optional<MerchantPreference> findByUserIdAndNormalizedPattern(String userId, String normalizedPattern);
    List<MerchantPreference> findByUserId(String userId);
    
    /**
     * Finds the best match for a given normalized name.
     * Uses pattern matching (e.g. contains).
     */
    Optional<MerchantPreference> findBestMatch(String userId, String normalizedName);
}
