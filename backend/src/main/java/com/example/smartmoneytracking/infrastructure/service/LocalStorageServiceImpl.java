package com.example.smartmoneytracking.infrastructure.service;

import com.example.smartmoneytracking.domain.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements StorageService {

    @Value("${app.upload.dir:./uploads/receipts}")
    private String uploadDir;

    @Override
    public String store(String fileName, byte[] bytes) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename to avoid collisions
        String extension = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
        String uniqueName = UUID.randomUUID().toString() + extension;
        
        Path filePath = uploadPath.resolve(uniqueName);
        Files.write(filePath, bytes);

        // Return the absolute path or a relative one depending on how the frontend/AI service accesses it
        // For local demo, returning the relative path
        return uniqueName;
    }

    @Override
    public void delete(String fileUrl) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileUrl);
        Files.deleteIfExists(filePath);
    }
}
