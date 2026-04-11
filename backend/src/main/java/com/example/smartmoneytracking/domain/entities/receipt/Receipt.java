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

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String imageUrl;

    private String storeName;

    private BigDecimal amount;

    private LocalDateTime transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptStatus status;

    private String transactionId;

    @Column(columnDefinition = "TEXT")
    private String rawOcrText;

    private Double confidence;
    private String categoryId;
    private Boolean isCorrected;

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
        this.storeName = storeName;
        this.amount = amount;
        this.transactionDate = date;
        this.rawOcrText = rawText;
        this.confidence = confidence;
        this.categoryId = categoryId;
        this.isCorrected = isCorrected;
        this.correctionReason = correctionReason;
        this.status = ReceiptStatus.PROCESSED;
    }

    public void confirm(String transactionId) {
        this.transactionId = transactionId;
        this.status = ReceiptStatus.CONFIRMED;
    }

    public void markFailed() {
        this.status = ReceiptStatus.FAILED;
    }
}
