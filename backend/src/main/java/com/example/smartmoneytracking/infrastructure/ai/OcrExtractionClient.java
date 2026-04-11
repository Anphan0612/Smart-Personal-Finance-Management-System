package com.example.smartmoneytracking.infrastructure.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OcrExtractionClient {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nlp.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public Map<String, Object> extractReceiptData(byte[] imageBytes, String fileName) {
        String url = aiServiceUrl.endsWith("/")
                ? aiServiceUrl + "api/ai/ocr-receipt"
                : aiServiceUrl + "/api/ai/ocr-receipt";

        try {
            String boundary = "---" + UUID.randomUUID().toString();
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .timeout(Duration.ofSeconds(60)) // OCR can be slow
                    .POST(buildMultipartBody(imageBytes, fileName, boundary))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
            }

            throw new RuntimeException("AI OCR service error: HTTP " + response.statusCode());
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI OCR service: " + e.getMessage(), e);
        }
    }

    private HttpRequest.BodyPublisher buildMultipartBody(byte[] fileBytes, String fileName, String boundary) {
        // Very basic multipart body builder for JDK HttpClient
        StringBuilder sb = new StringBuilder();
        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(fileName).append("\"\r\n");
        sb.append("Content-Type: image/jpeg\r\n\r\n");
        
        byte[] before = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] after = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);
        
        byte[] combined = new byte[before.length + fileBytes.length + after.length];
        System.arraycopy(before, 0, combined, 0, before.length);
        System.arraycopy(fileBytes, 0, combined, before.length, fileBytes.length);
        System.arraycopy(after, 0, combined, before.length + fileBytes.length, after.length);
        
        return HttpRequest.BodyPublishers.ofByteArray(combined);
    }
}
