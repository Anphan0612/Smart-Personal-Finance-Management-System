package com.example.smartmoneytracking.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartMoneyTrackingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartMoneyTracking API")
                        .description("Smart Personal Finance Management REST API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SmartMoneyTracking Team")));
    }
}
