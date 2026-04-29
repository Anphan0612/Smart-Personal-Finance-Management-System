package com.example.smartmoneytracking.application.service;

import com.example.smartmoneytracking.application.dto.AtelierChatRequest;
import com.example.smartmoneytracking.application.dto.AtelierChatResponse;

public interface AiChatIntentHandler {
    
    /**
     * Determines if this handler can process the given intent.
     * @param intent The intent recognized from the message (or default intent)
     * @return true if this handler can process it
     */
    boolean canHandle(String intent);

    /**
     * Processes the chat request and generates a response.
     * @param request The original request from the mobile client
     * @param userId The ID of the authenticated user
     * @return The AI response
     */
    AtelierChatResponse handle(AtelierChatRequest request, String userId);
}
