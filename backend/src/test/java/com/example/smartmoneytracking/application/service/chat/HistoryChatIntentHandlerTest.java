package com.example.smartmoneytracking.application.service.chat;

import com.example.smartmoneytracking.application.dto.AtelierChatRequest;
import com.example.smartmoneytracking.application.dto.AtelierChatResponse;
import com.example.smartmoneytracking.domain.entities.transaction.Transaction;
import com.example.smartmoneytracking.domain.entities.transaction.valueobject.TransactionType;
import com.example.smartmoneytracking.domain.repositories.CategoryRepository;
import com.example.smartmoneytracking.domain.repositories.TransactionRepository;
import com.example.smartmoneytracking.infrastructure.ai.NlpExtractionClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HistoryChatIntentHandlerTest {

    @Mock
    private NlpExtractionClient nlpExtractionClient;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private HistoryChatIntentHandler handler;

    private AtelierChatRequest request;

    @BeforeEach
    void setUp() {
        request = new AtelierChatRequest();
        request.setMessage("Show me my coffee expenses");
        request.setWalletId("wallet-123");
    }

    @Test
    void shouldHandleHistoryIntent() {
        assertThat(handler.canHandle("HISTORY")).isTrue();
    }

    @Test
    void shouldHandleQueryIntent() {
        assertThat(handler.canHandle("QUERY")).isTrue();
    }

    @Test
    void shouldNotHandleOtherIntents() {
        assertThat(handler.canHandle("COMMAND")).isFalse();
        assertThat(handler.canHandle("DEFAULT")).isFalse();
    }

    @Test
    void shouldReturnStandardizedResponseWithTransactionsKey() {
        // Arrange
        List<Transaction> transactions = createMockTransactions();
        when(transactionRepository.findByWalletIdAndTransactionDateBetween(
                eq("wallet-123"), any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(transactions);

        when(categoryRepository.findAllById(anySet())).thenReturn(Collections.emptyList());

        Map<String, Object> aiResult = new HashMap<>();
        aiResult.put("intent", "QUERY");
        aiResult.put("answer", "You spent 150,000 VND on coffee");
        // Use empty list since transaction IDs are null before persistence
        aiResult.put("matched_txn_ids", Collections.emptyList());
        aiResult.put("filters", Map.of("category", "COFFEE"));
        aiResult.put("summary", Map.of());

        when(nlpExtractionClient.queryHistory(anyString(), anyList())).thenReturn(aiResult);

        // Act
        AtelierChatResponse response = handler.handle(request, "user-123");

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getMessage()).isEqualTo("You spent 150,000 VND on coffee");
        assertThat(response.getType()).isEqualTo("QUERY");
        assertThat(response.getData()).isNotNull();

        // ✅ Verify standardized key: "transactions" (not "matchedTransactions")
        assertThat(response.getData()).containsKey("transactions");
        assertThat(response.getData()).doesNotContainKey("matchedTransactions");

        assertThat(response.getData()).containsKey("filters");
        assertThat(response.getData()).containsKey("summary");
    }

    @Test
    void shouldReturnEmptyTransactionsWhenNoMatches() {
        // Arrange
        when(transactionRepository.findByWalletIdAndTransactionDateBetween(
                eq("wallet-123"), any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(Collections.emptyList());

        Map<String, Object> aiResult = new HashMap<>();
        aiResult.put("intent", "QUERY");
        aiResult.put("answer", "No transactions found");
        aiResult.put("matched_txn_ids", Collections.emptyList());
        aiResult.put("filters", Map.of());
        aiResult.put("summary", Map.of());

        when(nlpExtractionClient.queryHistory(anyString(), anyList())).thenReturn(aiResult);

        // Act
        AtelierChatResponse response = handler.handle(request, "user-123");

        // Assert
        assertThat(response.getData().get("transactions")).isNotNull();
        assertThat((List<?>) response.getData().get("transactions")).isEmpty();
    }

    @Test
    void shouldIncludeSummaryInResponse() {
        // Arrange
        List<Transaction> transactions = createMockTransactions();
        when(transactionRepository.findByWalletIdAndTransactionDateBetween(
                eq("wallet-123"), any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(transactions);

        when(categoryRepository.findAllById(anySet())).thenReturn(Collections.emptyList());

        Map<String, Object> summaryData = new HashMap<>();
        summaryData.put("totalSpent", 500000);
        summaryData.put("budgetLimit", 1000000);
        summaryData.put("percentage", 50);

        Map<String, Object> aiResult = new HashMap<>();
        aiResult.put("intent", "SUMMARY");
        aiResult.put("answer", "Your spending summary");
        aiResult.put("matched_txn_ids", Collections.emptyList());
        aiResult.put("filters", Map.of());
        aiResult.put("summary", summaryData);

        when(nlpExtractionClient.queryHistory(anyString(), anyList())).thenReturn(aiResult);

        // Act
        AtelierChatResponse response = handler.handle(request, "user-123");

        // Assert
        assertThat(response.getData().get("summary")).isNotNull();
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) response.getData().get("summary");
        assertThat(summary).containsEntry("totalSpent", 500000);
        assertThat(summary).containsEntry("budgetLimit", 1000000);
        assertThat(summary).containsEntry("percentage", 50);
    }

    @Test
    void shouldIncludeFiltersInResponse() {
        // Arrange
        List<Transaction> transactions = createMockTransactions();
        when(transactionRepository.findByWalletIdAndTransactionDateBetween(
                eq("wallet-123"), any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(transactions);

        when(categoryRepository.findAllById(anySet())).thenReturn(Collections.emptyList());

        Map<String, Object> filtersData = new HashMap<>();
        filtersData.put("category", "COFFEE");
        filtersData.put("dateRange", "last_7_days");

        Map<String, Object> aiResult = new HashMap<>();
        aiResult.put("intent", "QUERY");
        aiResult.put("answer", "Filtered results");
        // Use empty list since transaction IDs are null before persistence
        aiResult.put("matched_txn_ids", Collections.emptyList());
        aiResult.put("filters", filtersData);
        aiResult.put("summary", Map.of());

        when(nlpExtractionClient.queryHistory(anyString(), anyList())).thenReturn(aiResult);

        // Act
        AtelierChatResponse response = handler.handle(request, "user-123");

        // Assert
        assertThat(response.getData().get("filters")).isNotNull();
        @SuppressWarnings("unchecked")
        Map<String, Object> filters = (Map<String, Object>) response.getData().get("filters");
        assertThat(filters).containsEntry("category", "COFFEE");
        assertThat(filters).containsEntry("dateRange", "last_7_days");
    }

    private List<Transaction> createMockTransactions() {
        Transaction txn1 = Transaction.create(
                "wallet-123",
                "cat-1",
                BigDecimal.valueOf(50000),
                TransactionType.EXPENSE,
                "Coffee at Starbucks",
                OffsetDateTime.now().minusDays(1)
        );

        Transaction txn2 = Transaction.create(
                "wallet-123",
                "cat-1",
                BigDecimal.valueOf(100000),
                TransactionType.EXPENSE,
                "Coffee at Highlands",
                OffsetDateTime.now().minusDays(2)
        );

        return List.of(txn1, txn2);
    }
}
