package com.example.smartmoneytracking.infrastructure.config;

import com.example.smartmoneytracking.application.service.common.TimezoneContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TimezoneInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String timezone = request.getHeader("X-Timezone");
        if (timezone != null && !timezone.isEmpty()) {
            TimezoneContextHolder.setTimezone(timezone);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TimezoneContextHolder.clear();
    }
}
