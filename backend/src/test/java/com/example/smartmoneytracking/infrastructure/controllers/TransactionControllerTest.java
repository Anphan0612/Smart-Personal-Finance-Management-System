package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.TransactionRequest;
import com.example.smartmoneytracking.application.dto.TransactionResponse;
import com.example.smartmoneytracking.application.usecase.*;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.exception.BusinessException;
import com.example.smartmoneytracking.domain.exception.ErrorCode;
import com.example.smartmoneytracking.infrastructure.exception.GlobalExceptionHandler;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private CreateTransactionUseCase createTransactionUseCase;
    @Mock
    private GetTransactionsByWalletIdUseCase getTransactionsByWalletIdUseCase;
    @Mock
    private GetTransactionByIdUseCase getTransactionByIdUseCase;
    @Mock
    private UpdateTransactionUseCase updateTransactionUseCase;
    @Mock
    private DeleteTransactionUseCase deleteTransactionUseCase;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private TransactionController transactionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        lenient().when(securityUtils.getCurrentUserId()).thenReturn("test-user-id");
    }

    @Nested
    @DisplayName("Validation Error Tests")
    class ValidationErrorTests {

        @Test
        @DisplayName("Should return validation error when amount is negative")
        void shouldReturnValidationError_whenAmountIsNegative() throws Exception {
            TransactionRequest request = TransactionRequest.builder()
                    .walletId("wallet-1")
                    .amount(new BigDecimal("-100"))
                    .type(TransactionType.EXPENSE)
                    .transactionDate(LocalDateTime.now().minusDays(1))
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.path").value("/api/v1/transactions"))
                    .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$.errors[?(@.field == 'amount')]").exists());
        }

        @Test
        @DisplayName("Should return validation error when amount is null")
        void shouldReturnValidationError_whenAmountIsNull() throws Exception {
            String jsonBody = """
                    {
                        "walletId": "wallet-1",
                        "type": "EXPENSE",
                        "transactionDate": "2025-01-01T10:00:00"
                    }
                    """;

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.errors[?(@.field == 'amount')]").exists());
        }

        @Test
        @DisplayName("Should return validation error when walletId is blank")
        void shouldReturnValidationError_whenWalletIdIsBlank() throws Exception {
            TransactionRequest request = TransactionRequest.builder()
                    .walletId("")
                    .amount(new BigDecimal("100"))
                    .type(TransactionType.EXPENSE)
                    .transactionDate(LocalDateTime.now().minusDays(1))
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.errors[?(@.field == 'walletId')]").exists());
        }

        @Test
        @DisplayName("Should return validation error when transactionDate is in the future")
        void shouldReturnValidationError_whenDateIsInFuture() throws Exception {
            TransactionRequest request = TransactionRequest.builder()
                    .walletId("wallet-1")
                    .amount(new BigDecimal("100"))
                    .type(TransactionType.EXPENSE)
                    .transactionDate(LocalDateTime.now().plusYears(5))
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.errors[?(@.field == 'transactionDate')]").exists());
        }

        @Test
        @DisplayName("Should return multiple validation errors simultaneously")
        void shouldReturnMultipleValidationErrors() throws Exception {
            String jsonBody = """
                    {
                        "walletId": "",
                        "amount": -50,
                        "type": null
                    }
                    """;

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(3))));
        }
    }

    @Nested
    @DisplayName("JSON Parse Error Tests")
    class JsonParseErrorTests {

        @Test
        @DisplayName("Should return JSON parse error for malformed JSON")
        void shouldReturnJsonParseError_whenJsonIsMalformed() throws Exception {
            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{invalid json}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("JSON_PARSE_ERROR"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.message").value("Invalid JSON format"));
        }
    }

    @Nested
    @DisplayName("Business Exception Tests")
    class BusinessExceptionTests {

        @Test
        @DisplayName("Should return business error when category not found")
        void shouldReturnBusinessError_whenCategoryNotFound() throws Exception {
            when(createTransactionUseCase.execute(any(TransactionRequest.class), anyString()))
                    .thenThrow(new BusinessException(ErrorCode.CATEGORY_NOT_FOUND,
                            "Category not found: invalid-cat-id"));

            TransactionRequest request = TransactionRequest.builder()
                    .walletId("wallet-1")
                    .categoryId("invalid-cat-id")
                    .amount(new BigDecimal("100"))
                    .type(TransactionType.INCOME)
                    .transactionDate(LocalDateTime.now().minusDays(1))
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.errorCode").value("CATEGORY_NOT_FOUND"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.message").value("Category not found: invalid-cat-id"));
        }

        @Test
        @DisplayName("Should return business error when wallet not found")
        void shouldReturnBusinessError_whenWalletNotFound() throws Exception {
            when(createTransactionUseCase.execute(any(TransactionRequest.class), anyString()))
                    .thenThrow(new BusinessException(ErrorCode.WALLET_NOT_FOUND,
                            "Wallet not found"));

            TransactionRequest request = TransactionRequest.builder()
                    .walletId("non-existent-wallet")
                    .amount(new BigDecimal("100"))
                    .type(TransactionType.INCOME)
                    .transactionDate(LocalDateTime.now().minusDays(1))
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.errorCode").value("WALLET_NOT_FOUND"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty());
        }

        @Test
        @DisplayName("Should return business error when insufficient balance")
        void shouldReturnBusinessError_whenInsufficientBalance() throws Exception {
            when(createTransactionUseCase.execute(any(TransactionRequest.class), anyString()))
                    .thenThrow(new BusinessException(ErrorCode.INSUFFICIENT_BALANCE,
                            "Insufficient wallet balance for this transaction"));

            TransactionRequest request = TransactionRequest.builder()
                    .walletId("wallet-1")
                    .amount(new BigDecimal("999999"))
                    .type(TransactionType.EXPENSE)
                    .transactionDate(LocalDateTime.now().minusDays(1))
                    .build();

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.errorCode").value("INSUFFICIENT_BALANCE"))
                    .andExpect(jsonPath("$.traceId").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("Error Response Structure Tests")
    class ErrorResponseStructureTests {

        @Test
        @DisplayName("Should include all required fields in error response")
        void shouldIncludeAllRequiredFields() throws Exception {
            String jsonBody = """
                    {
                        "walletId": "",
                        "type": "EXPENSE"
                    }
                    """;

            mockMvc.perform(post("/api/v1/transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.message").value("Validation failed"))
                    .andExpect(jsonPath("$.path").value("/api/v1/transactions"))
                    .andExpect(jsonPath("$.timestamp").isNotEmpty())
                    .andExpect(jsonPath("$.traceId").isNotEmpty())
                    .andExpect(jsonPath("$.errors").isArray());
        }
    }
}
