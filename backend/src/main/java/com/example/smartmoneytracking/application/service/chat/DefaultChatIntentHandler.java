package com.example.smartmoneytracking.application.service.chat;

import com.example.smartmoneytracking.application.dto.AtelierChatRequest;
import com.example.smartmoneytracking.application.dto.AtelierChatResponse;
import com.example.smartmoneytracking.application.service.AiChatIntentHandler;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class DefaultChatIntentHandler implements AiChatIntentHandler {

    @Override
    public boolean canHandle(String intent) {
        return "DEFAULT".equalsIgnoreCase(intent) || "UNKNOWN".equalsIgnoreCase(intent);
    }

    @Override
    public AtelierChatResponse handle(AtelierChatRequest request, String userId) {
        String message = request.getMessage().toLowerCase();
        
        // Simple heuristic for greetings
        String answer;
        if (message.contains("chào") || message.contains("hello") || message.contains("hi")) {
            answer = "Chào bạn! Mình là Atelier AI - Trợ lý tài chính thông minh của bạn. Mình có thể giúp gì cho bạn hôm nay?";
        } else {
            answer = "Xin lỗi, hiện tại mình chưa hiểu ý của bạn. Bạn có thể hỏi mình về lịch sử chi tiêu hoặc tóm tắt giao dịch nhé!";
        }

        return AtelierChatResponse.builder()
                .message(answer)
                .data(new HashMap<>())
                .type("DEFAULT")
                .build();
    }
}
