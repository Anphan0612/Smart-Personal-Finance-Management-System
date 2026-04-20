package com.example.smartmoneytracking.application.service;

import com.example.smartmoneytracking.domain.entities.receipt.Receipt;
import com.example.smartmoneytracking.domain.repositories.ReceiptRepository;
import com.example.smartmoneytracking.infrastructure.ai.OcrExtractionClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OcrAsyncService {

    private final OcrExtractionClient ocrExtractionClient;
    private final ReceiptRepository receiptRepository;
    private final MerchantMappingService merchantMappingService;
    private final com.example.smartmoneytracking.domain.repositories.CategoryRepository categoryRepository;

    @Async
    public void processOcrAsync(String receiptId, byte[] imageBytes, String fileName, String userTimezone) {
        long startTime = System.currentTimeMillis();
        log.info("[OCR] Starting background processing - Job: {}, File: {}", receiptId, fileName);
        
        try {
            // 1. Get current receipt status
            Receipt receipt = receiptRepository.findById(receiptId)
                    .orElseThrow(() -> new RuntimeException("Receipt not found for async processing: " + receiptId));
            
            String userId = receipt.getUserId();

            // 2. Call AI service
            Map<String, Object> ocrData = ocrExtractionClient.extractReceiptData(imageBytes, fileName);

            // 3. Extract and parse results
            String storeName = (String) ocrData.getOrDefault("store_name", "Unknown Store");
            Double amountDbl = (Double) ocrData.getOrDefault("amount", 0.0);
            BigDecimal amount = BigDecimal.valueOf(amountDbl);
            String dateStr = (String) ocrData.get("transaction_date");
            String rawText = (String) ocrData.get("raw_text");

            // OCR v3 metadata
            Double confidence = ocrData.get("confidence") != null ? ((Number) ocrData.get("confidence")).doubleValue() : null;
            String categoryId = (String) ocrData.get("category_id");
            Boolean isCorrected = ocrData.get("is_corrected") != null ? (Boolean) ocrData.get("is_corrected") : false;
            String correctionReason = (String) ocrData.get("correction_reason");

            LocalDateTime date = null;
            if (dateStr != null && !dateStr.isEmpty()) {
                try {
                    if (dateStr.contains("/")) {
                        String[] parts = dateStr.split("/");
                        if (parts.length == 3) {
                            int day = Integer.parseInt(parts[0]);
                            int month = Integer.parseInt(parts[1]);
                            int year = Integer.parseInt(parts[2]);
                            if (year < 100) year += 2000;
                            // Set time to 12:00 noon to avoid timezone shift issues
                            LocalDateTime localDate = LocalDateTime.of(year, month, day, 12, 0);

                            // Convert from User Timezone to UTC for storage
                            ZoneId userZone = ZoneId.of(userTimezone);
                            date = ZonedDateTime.of(localDate, userZone)
                                    .withZoneSameInstant(ZoneOffset.UTC)
                                    .toLocalDateTime();
                        }
                    }
                } catch (Exception e) {
                    date = com.example.smartmoneytracking.application.service.common.DateUtils.nowUtc();
                }
            }

            // 4. Intelligence Layer: Mapping priority
            String finalCategoryId = null;
            boolean isMappedFromHistory = false;
            
            // Priority 1: User Confirmation History (Merchant-based mapping)
            Optional<String> preferredCategory = merchantMappingService.findPreferredCategoryId(userId, storeName);
            if (preferredCategory.isPresent()) {
                finalCategoryId = preferredCategory.get();
                isMappedFromHistory = true;
                log.info("[OCR] Applied user preference for {}: {}", storeName, finalCategoryId);
            } 
            // Priority 2: AI Predicted Label mapping to DB Category
            else if (categoryId != null && !categoryId.isEmpty()) {
                Optional<com.example.smartmoneytracking.domain.entities.category.Category> dbCategory =
                        categoryRepository.findByNlpLabel(categoryId);
                if (dbCategory.isPresent()) {
                    finalCategoryId = dbCategory.get().getId();
                    log.info("[OCR] Resolved AI label '{}' to DB category: {}", categoryId, dbCategory.get().getName());
                } else {
                    log.warn("[OCR] AI predicted label '{}' not found in DB categories, applying fallback", categoryId);
                    finalCategoryId = findFallbackCategory(categoryId);
                }
            }

            // 5. Update receipt with results
            receipt.updateOcrResult(storeName, amount, date, rawText, confidence, finalCategoryId, isCorrected, correctionReason);
            receipt.setIsMappedFromHistory(isMappedFromHistory);
            
            receiptRepository.save(receipt);
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("[OCR] ✅ Job SUCCESS - ID: {}, User: {}, Store: {}, Amount: {}, Duration: {}ms", 
                    receiptId, userId, storeName, amount, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[OCR] ❌ Job FAILED - ID: {}, Duration: {}ms, Error: {}", receiptId, duration, e.getMessage());
            receiptRepository.findById(receiptId).ifPresent(r -> {
                r.markFailed();
                receiptRepository.save(r);
            });
        }
    }

    /**
     * Fallback logic when AI label doesn't match any database nlp_label.
     * Provides graceful degradation by mapping to similar existing categories.
     *
     * @param unmappedLabel The AI-predicted label that has no direct database mapping
     * @return A fallback category ID, or null if no suitable fallback exists
     */
    private String findFallbackCategory(String unmappedLabel) {
        // Map unmapped AI labels to existing database categories as temporary fallback
        String fallbackNlpLabel = switch (unmappedLabel.toUpperCase()) {
            case "FOOD" -> "DINING";           // Map FOOD to existing DINING
            case "UTILITIES" -> "HOUSING";     // Map UTILITIES to existing HOUSING
            case "HEALTH" -> "SHOPPING";       // Temporary: map healthcare to shopping
            case "EDUCATION" -> "SHOPPING";    // Temporary: map education to shopping
            case "HOUSEHOLD" -> "GROCERIES";   // Household items → groceries
            case "GIFT" -> "SHOPPING";         // Gifts → shopping
            case "SAVING" -> null;             // Savings should be TRANSFER type
            case "OTHER_EXPENSE" -> "SHOPPING"; // Generic expense → shopping
            case "OTHER_INCOME" -> "FREELANCE"; // Generic income → freelance
            default -> {
                log.warn("[OCR] No fallback mapping defined for label '{}'", unmappedLabel);
                yield "SHOPPING"; // Ultimate fallback: most receipts are shopping
            }
        };

        if (fallbackNlpLabel == null) {
            log.warn("[OCR] No fallback available for label '{}', leaving categoryId null", unmappedLabel);
            return null;
        }

        Optional<com.example.smartmoneytracking.domain.entities.category.Category> fallbackCategory =
                categoryRepository.findByNlpLabel(fallbackNlpLabel);

        if (fallbackCategory.isPresent()) {
            log.info("[OCR] Applied fallback mapping: '{}' -> '{}' ({})",
                    unmappedLabel, fallbackNlpLabel, fallbackCategory.get().getName());
            return fallbackCategory.get().getId();
        }

        log.error("[OCR] CRITICAL: Fallback category '{}' not found in database for unmapped label '{}'",
                fallbackNlpLabel, unmappedLabel);
        return null;
    }
}
