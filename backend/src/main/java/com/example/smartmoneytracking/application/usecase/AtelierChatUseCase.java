package com.example.smartmoneytracking.application.usecase;

import com.example.smartmoneytracking.application.dto.AtelierChatRequest;
import com.example.smartmoneytracking.application.dto.AtelierChatResponse;
import com.example.smartmoneytracking.application.service.AiChatIntentHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AtelierChatUseCase {

    private final List<AiChatIntentHandler> intentHandlers;

    public AtelierChatResponse execute(AtelierChatRequest request, String userId) {
        // Simple Intent Recognition Placeholder
        // Currently we map everything to "HISTORY" unless it's a very simple greeting
        String intent = determineIntent(request.getMessage());

        AiChatIntentHandler selectedHandler = intentHandlers.stream()
                .filter(handler -> handler.canHandle(intent))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No handler found for intent: " + intent));

        return selectedHandler.handle(request, userId);
    }

    private String determineIntent(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "DEFAULT";
        }
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.equals("chào") || lowerMsg.equals("hello") || lowerMsg.equals("hi") || lowerMsg.equals("bạn là ai")) {
            return "DEFAULT";
        }
        
        // For now, everything else goes to the HISTORY pipeline which calls Python AI Service
        return "HISTORY";
    }
}
