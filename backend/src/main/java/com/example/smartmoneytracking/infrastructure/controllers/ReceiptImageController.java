package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/receipts/images")
@RequiredArgsConstructor
public class ReceiptImageController {

    @Value("${app.upload.dir:./uploads/receipts}")
    private String uploadDir;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg"; // Default
                if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
                else if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, "Could not serve image: " + e.getMessage()));
        }
    }
}
