package com.example.smartmoneytracking.application.service.common;

/**
 * Thread-local context for managing the user's timezone during a request.
 */
public class TimezoneContextHolder {
    private static final ThreadLocal<String> TIMEZONE_HOLDER = new ThreadLocal<>();
    private static final String DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

    public static void setTimezone(String timezone) {
        TIMEZONE_HOLDER.set(timezone);
    }

    public static String getTimezone() {
        String tz = TIMEZONE_HOLDER.get();
        return (tz != null && !tz.isEmpty()) ? tz : DEFAULT_TIMEZONE;
    }

    public static void clear() {
        TIMEZONE_HOLDER.remove();
    }
}
