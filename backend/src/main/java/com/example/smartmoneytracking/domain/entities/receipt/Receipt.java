package com.example.smartmoneytracking.domain.entities.receipt;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    @Setter(AccessLevel.PRIVATE)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    private String storeName;
    private String aiStoreName;

    private BigDecimal amount;
    private BigDecimal aiAmount;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptStatus status;

    private String transactionId;

    @Column(columnDefinition = "TEXT")
    private String rawOcrText;

    private Double confidence;
    private Double aiConfidence;

    private String categoryId;
    private String aiCategoryId;

    private Boolean isCorrected;
    private Boolean isMappedFromHistory;

    @Column(columnDefinition = "TEXT")
    private String correctionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ReceiptStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static Receipt create(String userId, String imageUrl) {
        Receipt receipt = new Receipt();
        receipt.userId = userId;
        receipt.imageUrl = imageUrl;
        receipt.status = ReceiptStatus.PENDING;
        return receipt;
    }

    public void updateOcrResult(String storeName, BigDecimal amount, LocalDateTime date, String rawText,
                                Double confidence, String categoryId, Boolean isCorrected, String correctionReason) {
        // Store both AI prediction and initial effective value
        this.storeName = storeName;
        this.aiStoreName = storeName;
        
        this.amount = amount;
        this.aiAmount = amount;
        
        this.transactionDate = date;
        this.rawOcrText = rawText;
        
        this.confidence = confidence;
        this.aiConfidence = confidence;
        
        this.categoryId = categoryId;
        this.aiCategoryId = categoryId;
        
        this.isCorrected = isCorrected;
        this.correctionReason = correctionReason;
        this.isMappedFromHistory = false; // Default to false, can be set by service
        this.status = ReceiptStatus.PROCESSED;
    }

    public void applyManualOverride(String storeName, BigDecimal amount, String categoryId) {
        this.storeName = storeName;
        this.amount = amount;
        this.categoryId = categoryId;
    }

    public void confirm(String transactionId) {
        this.transactionId = transactionId;
        this.status = ReceiptStatus.CONFIRMED;
    }

    public void markFailed() {
        this.status = ReceiptStatus.FAILED;
    }
}
