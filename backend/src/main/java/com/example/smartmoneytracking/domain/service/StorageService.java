package com.example.smartmoneytracking.domain.service;

import java.io.IOException;

public interface StorageService {
    /**
     * Stores a file and returns its public URL or local path.
     * @param fileName Name of the file
     * @param bytes File content
     * @return URL or Path where file is stored
     * @throws IOException if storage fails
     */
    String store(String fileName, byte[] bytes) throws IOException;

    /**
     * Deletes a file.
     * @param fileUrl URL or Path of the file
     * @throws IOException if deletion fails
     */
    void delete(String fileUrl) throws IOException;
}
