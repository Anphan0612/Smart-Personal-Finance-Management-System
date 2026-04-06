package com.example.smartmoneytracking.infrastructure.ai;

import com.example.smartmoneytracking.application.dto.NlpExtractTransactionRequest;
import com.example.smartmoneytracking.application.dto.NlpExtractTransactionResponse;
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

@Service
@RequiredArgsConstructor
public class NlpExtractionClient {

    // Avoid constructor injection: tests may not always auto-configure an ObjectMapper bean.
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nlp.service.url:http://localhost:8000}")
    private String nlpServiceUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public NlpExtractTransactionResponse extractTransaction(NlpExtractTransactionRequest request) {
        String url = nlpServiceUrl.endsWith("/")
                ? nlpServiceUrl + "api/ai/extract-transaction"
                : nlpServiceUrl + "/api/ai/extract-transaction";

        try {
            String json = objectMapper.writeValueAsString(Map.of("text", request.getText()));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                // Matches FastAPI EntityResponse contract.
                NlpExtractTransactionResponse dto = objectMapper.readValue(response.body(), NlpExtractTransactionResponse.class);
                dto.setCategoryId(null);
                return dto;
            }

            if (response.statusCode() == 422) {
                Map<String, Object> payload = objectMapper.readValue(
                        response.body(),
                        new TypeReference<Map<String, Object>>() {
                        }
                );
                Object detailObj = payload.get("detail");
                if (detailObj instanceof Map<?, ?> detailMap) {
                    String message = String.valueOf(detailMap.get("message"));
                    String errorCode = String.valueOf(detailMap.get("error"));
                    String suggestion = String.valueOf(detailMap.get("suggestion"));
                    throw new NlpExtractionException(message, errorCode, suggestion);
                }
            }

            throw new NlpExtractionException(
                    "NLP service error: HTTP " + response.statusCode(),
                    "NLP_SERVICE_ERROR",
                    null
            );
        } catch (IOException e) {
            throw new NlpExtractionException("Failed to parse NLP response", "NLP_PARSE_ERROR", null);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new NlpExtractionException("NLP request interrupted", "NLP_INTERRUPTED", null);
        }
    }

    public Map<String, String> generateInsights(Object comparisonData) {
        String url = nlpServiceUrl.endsWith("/")
                ? nlpServiceUrl + "api/ai/generate-insights"
                : nlpServiceUrl + "/api/ai/generate-insights";

        try {
            String json = objectMapper.writeValueAsString(comparisonData);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<Map<String, String>>() {});
            }

            throw new RuntimeException("AI Insight service error: HTTP " + response.statusCode());
        } catch (Exception e) {
            return Map.of("insight", "Atelier AI đang bận một chút, hãy thử lại sau nhé!");
        }
    }

    public Map<String, String> getBudgetInsight(String categoryName, String threshold) {
        String url = nlpServiceUrl.endsWith("/")
                ? nlpServiceUrl + "api/ai/budget-insight"
                : nlpServiceUrl + "/api/ai/budget-insight";

        try {
            Map<String, String> body = Map.of("category_name", categoryName != null ? categoryName : "", "threshold", threshold);
            String json = objectMapper.writeValueAsString(body);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<Map<String, String>>() {});
            }

            return Map.of("insight", "Tiến độ của bạn đang được theo dõi.");
        } catch (Exception e) {
            return Map.of("insight", "Trợ lý AI đang cập nhật thông tin.");
        }
    }

    /**
     * Smart History Query: classify intent and generate AI answer.
     */
    public Map<String, Object> queryHistory(String text, java.util.List<Map<String, Object>> transactions) {
        String url = nlpServiceUrl.endsWith("/")
                ? nlpServiceUrl + "api/ai/query-history"
                : nlpServiceUrl + "/api/ai/query-history";

        try {
            Map<String, Object> body = Map.of("text", text, "transactions", transactions);
            String json = objectMapper.writeValueAsString(body);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
            }

            throw new RuntimeException("AI Query service error: HTTP " + response.statusCode());
        } catch (Exception e) {
            return Map.of(
                    "intent", "QUERY",
                    "answer", "Atelier AI đang gặp khó khăn khi truy vấn dữ liệu. Vui lòng thử lại.",
                    "filters", Map.of(),
                    "summary", Map.of()
            );
        }
    }

    /**
     * Anomaly Detection: check transaction list for spending anomalies.
     */
    public Map<String, Object> detectAnomalies(java.util.List<Map<String, Object>> transactions, double zThreshold) {
        String url = nlpServiceUrl.endsWith("/")
                ? nlpServiceUrl + "api/ai/detect-anomalies"
                : nlpServiceUrl + "/api/ai/detect-anomalies";

        try {
            Map<String, Object> body = Map.of("transactions", transactions, "z_threshold", zThreshold);
            String json = objectMapper.writeValueAsString(body);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
            }

            return Map.of("anomalies", java.util.List.of(), "total_checked", 0);
        } catch (Exception e) {
            return Map.of("anomalies", java.util.List.of(), "total_checked", 0);
        }
    }
}
