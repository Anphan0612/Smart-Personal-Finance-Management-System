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
import com.example.smartmoneytracking.infrastructure.ai.OcrExtractionClient;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
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

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ReceiptResponse>> uploadReceipt(@RequestParam("file") MultipartFile file) {
        String userId = securityUtils.getCurrentUserId();
        
        try {
            // 1. Store the file
            byte[] bytes = file.getBytes();
            String fileUrl = storageService.store(file.getOriginalFilename(), bytes);
            
            // 2. Create initial record
            Receipt receipt = Receipt.create(userId, fileUrl);
            receipt = receiptRepository.save(receipt);
            
            // 3. Call AI service for OCR (Async would be better, but doing sync for simplicity as requested)
            try {
                Map<String, Object> ocrData = ocrExtractionClient.extractReceiptData(bytes, file.getOriginalFilename());
                
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
                        // Very basic date parsing, OCR result usually dd/MM/yyyy
                        if (dateStr.contains("/")) {
                            String[] parts = dateStr.split("/");
                            if (parts.length == 3) {
                                int day = Integer.parseInt(parts[0]);
                                int month = Integer.parseInt(parts[1]);
                                int year = Integer.parseInt(parts[2]);
                                if (year < 100) year += 2000;
                                date = LocalDateTime.of(year, month, day, 0, 0);
                            }
                        }
                    } catch (Exception e) {
                        date = LocalDateTime.now();
                    }
                }
                
                receipt.updateOcrResult(storeName, amount, date, rawText, confidence, categoryId, isCorrected, correctionReason);
                receipt = receiptRepository.save(receipt);
            } catch (Exception e) {
                receipt.markFailed();
                receiptRepository.save(receipt);
                // We still return the receipt so user can fill manually
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(mapToResponse(receipt)));
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

        TransactionResponse txResponse = createTransactionUseCase.execute(txRequest, userId);
        
        receipt.confirm(txResponse.getId());
        receiptRepository.save(receipt);

        return ResponseEntity.ok(ApiResponse.success(txResponse));
    }

    private ReceiptResponse mapToResponse(Receipt receipt) {
        return ReceiptResponse.builder()
                .id(receipt.getId())
                .imageUrl(receipt.getImageUrl())
                .storeName(receipt.getStoreName())
                .amount(receipt.getAmount())
                .transactionDate(receipt.getTransactionDate())
                .status(receipt.getStatus())
                .transactionId(receipt.getTransactionId())
                .confidence(receipt.getConfidence())
                .categoryId(receipt.getCategoryId())
                .isCorrected(receipt.getIsCorrected())
                .correctionReason(receipt.getCorrectionReason())
                .build();
    }
}
