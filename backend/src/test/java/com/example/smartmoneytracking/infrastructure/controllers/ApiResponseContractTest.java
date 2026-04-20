package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.common.ApiResponse;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ApiResponse Contract Tests")
class ApiResponseContractTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @Nested
    @DisplayName("Success Response Contract")
    class SuccessResponseContract {

        @Test
        @DisplayName("success() should set correct fields")
        void success_shouldSetCorrectFields() {
            ApiResponse<String> response = ApiResponse.success("test-data");

            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getCode()).isEqualTo(200);
            assertThat(response.getMessage()).isEqualTo("Operation successful");
            assertThat(response.getData()).isEqualTo("test-data");
            assertThat(response.getTimestamp()).isNotNull();

            assertThat(response.getErrorCode()).isNull();
            assertThat(response.getTraceId()).isNull();
            assertThat(response.getPath()).isNull();
            assertThat(response.getFieldErrors()).isNull();
        }

        @Test
        @DisplayName("created() should set 201 status")
        void created_shouldSet201Status() {
            ApiResponse<String> response = ApiResponse.created("new-resource");

            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getCode()).isEqualTo(201);
            assertThat(response.getMessage()).isEqualTo("Resource created successfully");
            assertThat(response.getData()).isEqualTo("new-resource");
        }

        @Test
        @DisplayName("Success response should serialize without error fields")
        void success_shouldSerializeWithoutErrorFields() throws Exception {
            ApiResponse<String> response = ApiResponse.success("data");
            String json = objectMapper.writeValueAsString(response);

            assertThat(json).contains("\"success\":true");
            assertThat(json).contains("\"data\":\"data\"");
            // Verify timestamp is an ISO string, not a number
            assertThat(json).matches(".*\"timestamp\":\"\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*Z\".*");
            assertThat(json).doesNotContain("errorCode");
            assertThat(json).doesNotContain("traceId");
            assertThat(json).doesNotContain("path");
            assertThat(json).doesNotContain("fieldErrors");
        }
    }

    @Nested
    @DisplayName("Error Response Contract")
    class ErrorResponseContract {

        @Test
        @DisplayName("error() should set correct fields")
        void error_shouldSetCorrectFields() {
            ApiResponse<Void> response = ApiResponse.error(
                    ErrorCode.VALIDATION_ERROR,
                    "Validation failed",
                    "/api/v1/test",
                    "trace-123");

            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getCode()).isEqualTo(400);
            assertThat(response.getErrorCode()).isEqualTo("VALIDATION_ERROR");
            assertThat(response.getMessage()).isEqualTo("Validation failed");
            assertThat(response.getPath()).isEqualTo("/api/v1/test");
            assertThat(response.getTraceId()).isEqualTo("trace-123");
            assertThat(response.getTimestamp()).isNotNull();

            assertThat(response.getData()).isNull();
        }

        @Test
        @DisplayName("error() with fieldErrors should include them")
        void error_withFieldErrors_shouldIncludeThem() {
            List<ApiResponse.FieldError> fieldErrors = List.of(
                    ApiResponse.FieldError.builder()
                            .field("amount")
                            .message("must be positive")
                            .build(),
                    ApiResponse.FieldError.builder()
                            .field("walletId")
                            .message("must not be blank")
                            .build()
            );

            ApiResponse<Void> response = ApiResponse.error(
                    ErrorCode.VALIDATION_ERROR,
                    "Validation failed",
                    "/api/v1/transactions",
                    "trace-456",
                    fieldErrors);

            assertThat(response.getFieldErrors()).hasSize(2);
            assertThat(response.getFieldErrors().get(0).getField()).isEqualTo("amount");
            assertThat(response.getFieldErrors().get(1).getField()).isEqualTo("walletId");
        }

        @Test
        @DisplayName("Error response should serialize without data field")
        void error_shouldSerializeWithoutDataField() throws Exception {
            ApiResponse<Void> response = ApiResponse.error(
                    ErrorCode.INTERNAL_ERROR,
                    "Unexpected error",
                    "/api/v1/test",
                    "trace-789");

            String json = objectMapper.writeValueAsString(response);

            assertThat(json).contains("\"success\":false");
            assertThat(json).contains("\"errorCode\":\"INTERNAL_ERROR\"");
            assertThat(json).contains("\"traceId\":\"trace-789\"");
            assertThat(json).doesNotContain("\"data\"");
        }
    }

    @Nested
    @DisplayName("ErrorCode Mapping Contract")
    class ErrorCodeMappingContract {

        @Test
        @DisplayName("All ErrorCodes should produce valid ApiResponse")
        void allErrorCodes_shouldProduceValidResponse() {
            for (ErrorCode code : ErrorCode.values()) {
                ApiResponse<Void> response = ApiResponse.error(
                        code, code.getDefaultMessage(), "/test", "trace");

                assertThat(response.isSuccess()).isFalse();
                assertThat(response.getCode()).isEqualTo(code.getHttpStatus());
                assertThat(response.getErrorCode()).isEqualTo(code.name());
                assertThat(response.getMessage()).isEqualTo(code.getDefaultMessage());
            }
        }
    }
}
