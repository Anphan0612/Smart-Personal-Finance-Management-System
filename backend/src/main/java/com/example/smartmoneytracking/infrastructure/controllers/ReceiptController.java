package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.ConfirmReceiptRequest;
import com.example.smartmoneytracking.application.dto.ReceiptResponse;
import com.example.smartmoneytracking.application.dto.TransactionRequest;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.application.usecase.CreateTransactionUseCase;
import com.example.smartmoneytracking.domain.entities.receipt.Receipt;
import com.example.smartmoneytracking.domain.entities.receipt.ReceiptStatus;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.domain.repositories.ReceiptRepository;
import com.example.smartmoneytracking.domain.service.StorageService;
import com.example.smartmoneytracking.application.service.OcrAsyncService;
import com.example.smartmoneytracking.infrastructure.ai.OcrExtractionClient;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import com.example.smartmoneytracking.application.service.MerchantMappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptRepository receiptRepository;
    private final StorageService storageService;
    private final OcrExtractionClient ocrExtractionClient;
    private final SecurityUtils securityUtils;
    private final CreateTransactionUseCase createTransactionUseCase;
    private final OcrAsyncService ocrAsyncService;
    private final MerchantMappingService merchantMappingService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ReceiptResponse>> uploadReceipt(@RequestParam("file") MultipartFile file) {
        String userId = securityUtils.getCurrentUserId();
        
        try {
            // 1. Store the file
            byte[] bytes = file.getBytes();
            String fileUrl = storageService.store(file.getOriginalFilename(), bytes);
            
            // 2. Create initial record with PENDING status
            Receipt receipt = Receipt.create(userId, fileUrl);
            receipt = receiptRepository.save(receipt);
            
            // 3. Trigger Async OCR processing
            ocrAsyncService.processOcrAsync(receipt.getId(), bytes, file.getOriginalFilename(), com.example.smartmoneytracking.application.service.common.TimezoneContextHolder.getTimezone());
            
            // Return 202 Accepted immediately so Mobile can start polling
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.success(mapToResponse(receipt)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, "Failed to upload receipt: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReceiptResponse>>> getMyReceipts() {
        String userId = securityUtils.getCurrentUserId();
        List<ReceiptResponse> responses = receiptRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceiptResponse>> getReceipt(@PathVariable String id) {
        return receiptRepository.findById(id)
                .map(r -> ResponseEntity.ok(ApiResponse.success(mapToResponse(r))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<TransactionResponse>> confirmReceipt(
            @PathVariable String id,
            @RequestBody ConfirmReceiptRequest request) {
        
        String userId = securityUtils.getCurrentUserId();
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));

        if (!receipt.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Convert ConfirmReceiptRequest to TransactionRequest
        TransactionRequest txRequest = new TransactionRequest();
        txRequest.setWalletId(request.getWalletId());
        txRequest.setCategoryId(request.getCategoryId());
        txRequest.setAmount(request.getAmount());
        txRequest.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now());
        txRequest.setDescription("Receipt: " + request.getStoreName() + (request.getDescription() != null ? " - " + request.getDescription() : ""));
        txRequest.setType(TransactionType.EXPENSE);
        txRequest.setReceiptImageUrl(receipt.getImageUrl());

        TransactionResponse txResponse = createTransactionUseCase.execute(txRequest, userId);
        
        // Intelligence Layer: Implicit Learning
        // Learn from user manual override (or confirmation)
        merchantMappingService.upsertPreference(userId, request.getStoreName(), request.getCategoryId());

        receipt.confirm(txResponse.getId());
        receiptRepository.save(receipt);

        return ResponseEntity.ok(ApiResponse.success(txResponse));
    }

    private ReceiptResponse mapToResponse(Receipt receipt) {
        return ReceiptResponse.builder()
                .id(receipt.getId())
                .imageUrl(receipt.getImageUrl())
                .storeName(receipt.getStoreName())
                .aiStoreName(receipt.getAiStoreName())
                .amount(receipt.getAmount())
                .aiAmount(receipt.getAiAmount())
                .transactionDate(receipt.getTransactionDate())
                .status(receipt.getStatus())
                .transactionId(receipt.getTransactionId())
                .confidence(receipt.getConfidence())
                .aiConfidence(receipt.getAiConfidence())
                .categoryId(receipt.getCategoryId())
                .aiCategoryId(receipt.getAiCategoryId())
                .isCorrected(receipt.getIsCorrected())
                .isMappedFromHistory(receipt.getIsMappedFromHistory())
                .correctionReason(receipt.getCorrectionReason())
                .build();
    }
}
