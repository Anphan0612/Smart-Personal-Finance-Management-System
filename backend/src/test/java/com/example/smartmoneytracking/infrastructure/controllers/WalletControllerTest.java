package com.example.smartmoneytracking.infrastructure.controllers;

import com.example.smartmoneytracking.application.dto.WalletRequest;
import com.example.smartmoneytracking.application.dto.WalletResponse;
import com.example.smartmoneytracking.application.dto.WalletUpdateRequest;
import com.example.smartmoneytracking.application.usecase.*;
import com.example.smartmoneytracking.domain.entities.wallet.valueobject.WalletType;
import com.example.smartmoneytracking.infrastructure.exception.GlobalExceptionHandler;
import com.example.smartmoneytracking.infrastructure.security.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class WalletControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private CreateWalletUseCase createWalletUseCase;
    @Mock
    private GetWalletsByUserIdUseCase getWalletsByUserIdUseCase;
    @Mock
    private GetWalletByIdUseCase getWalletByIdUseCase;
    @Mock
    private UpdateWalletUseCase updateWalletUseCase;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private WalletController walletController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(walletController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        lenient().when(securityUtils.getCurrentUserId()).thenReturn("user-1");
    }

    @Test
    @DisplayName("Should create bank wallet successfully")
    void shouldCreateBankWallet() throws Exception {
        WalletRequest request = new WalletRequest();
        request.setName("Savings");
        request.setType(WalletType.BANK);
        request.setBalance(new BigDecimal("1000"));
        request.setCurrencyCode("USD");
        request.setBankName("Chase");
        request.setAccountNumber("123456789");
        request.setBranch("Downtown");

        WalletResponse response = new WalletResponse();
        response.setId("wallet-1");
        response.setName("Savings");
        response.setBalance(new BigDecimal("1000"));
        response.setType(WalletType.BANK);
        response.setBankName("Chase");
        response.setAccountNumber("123456789");
        response.setBranch("Downtown");

        when(createWalletUseCase.execute(any(WalletRequest.class), eq("user-1"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/wallets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("wallet-1"))
                .andExpect(jsonPath("$.data.type").value("BANK"))
                .andExpect(jsonPath("$.data.bankName").value("Chase"));
    }

    @Test
    @DisplayName("Should update wallet bank details")
    void shouldUpdateWalletBankDetails() throws Exception {
        WalletUpdateRequest request = new WalletUpdateRequest();
        request.setName("Savings Updated");
        request.setBankName("Wells Fargo");

        WalletResponse response = new WalletResponse();
        response.setId("wallet-1");
        response.setName("Savings Updated");
        response.setBankName("Wells Fargo");

        when(updateWalletUseCase.execute(eq("wallet-1"), any(WalletUpdateRequest.class), eq("user-1"))).thenReturn(response);

        mockMvc.perform(put("/api/v1/wallets/wallet-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bankName").value("Wells Fargo"));
    }

    @Test
    @DisplayName("Should list wallets with bank details")
    void shouldListWalletsWithBankDetails() throws Exception {
        WalletResponse wallet = new WalletResponse();
        wallet.setId("wallet-1");
        wallet.setName("Bank Wallet");
        wallet.setType(WalletType.BANK);
        wallet.setBankName("VIB");

        when(getWalletsByUserIdUseCase.execute("user-1")).thenReturn(List.of(wallet));

        mockMvc.perform(get("/api/v1/wallets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].bankName").value("VIB"));
    }
}
