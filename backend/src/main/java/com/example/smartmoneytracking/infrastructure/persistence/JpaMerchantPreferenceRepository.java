package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.merchant.MerchantPreference;
import com.example.smartmoneytracking.domain.repositories.MerchantPreferenceRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaMerchantPreferenceRepository extends JpaRepository<MerchantPreference, String>, MerchantPreferenceRepository {

    @Override
    Optional<MerchantPreference> findByUserIdAndNormalizedPattern(String userId, String normalizedPattern);

    @Override
    List<MerchantPreference> findByUserId(String userId);

    @Override
    @Query("SELECT mp FROM MerchantPreference mp " +
           "WHERE mp.userId = :userId AND :normalizedName LIKE CONCAT('%', mp.normalizedPattern, '%') " +
           "ORDER BY mp.lastUsedAt DESC LIMIT 1")
    Optional<MerchantPreference> findBestMatch(@Param("userId") String userId, @Param("normalizedName") String normalizedName);
}
