package com.example.smartmoneytracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@EnableAsync
@SpringBootApplication
public class SmartMoneyTrackingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartMoneyTrackingApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Force UTC for internal logic and storage
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
}
