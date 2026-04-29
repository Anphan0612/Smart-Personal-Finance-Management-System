package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import com.example.smartmoneytracking.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
class TransactionControllerSecurityIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String validToken;

    @BeforeEach
    void setUp() {
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        User user = User.create(
                "security-user-" + uniqueId,
                "security.user." + uniqueId + "@example.com",
                "$2a$10$wsRK80ib84iUYMKjR2uPyePPQkx6miiJm5GUEni9BxJgjZGQbj4Dq",
                "09" + (System.currentTimeMillis() % 1000000 + (int)(Math.random() * 1000)),
                "012345678901"
        );
        user.setId(UUID.randomUUID().toString());
        user.setEnabled(true);
        userRepository.save(user);
        validToken = jwtTokenProvider.generateAccessToken(user);
    }

    @Test
    void shouldReturnUnauthorizedWhenNoToken() throws Exception {
        mockMvc.perform(get("/api/v1/transactions")
                        .param("walletId", "wallet-1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnUnauthorizedWhenTokenMalformed() throws Exception {
        mockMvc.perform(get("/api/v1/transactions")
                        .param("walletId", "wallet-1")
                        .header("Authorization", "Bearer malformed.token.value"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnBadRequestWhenAuthenticatedButInvalidBody() throws Exception {
        String body = "{}";

        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
