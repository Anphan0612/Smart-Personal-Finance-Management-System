package com.example.smartmoneytracking.application.service.common;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class DateUtils {

    /**
     * Returns the current time in the user's timezone as a ZonedDateTime.
     */
    public static ZonedDateTime nowInUserTz() {
        return ZonedDateTime.now(ZoneId.of(TimezoneContextHolder.getTimezone()));
    }

    /**
     * Converts a localized time to UTC LocalDateTime for database storage/querying.
     */
    public static LocalDateTime toUtc(ZonedDateTime zonedDateTime) {
        return zonedDateTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
    }
    
    /**
     * Gets the start of the current day in the user's timezone, converted to UTC.
     */
    public static LocalDateTime getStartOfTodayInUtc() {
        ZonedDateTime localStart = nowInUserTz().toLocalDate().atStartOfDay(ZoneId.of(TimezoneContextHolder.getTimezone()));
        return toUtc(localStart);
    }

    /**
     * Converts a LocalDateTime (assumed to be in user's timezone) to UTC for storage.
     */
    public static LocalDateTime localToUtc(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return ZonedDateTime.of(localDateTime, ZoneId.of(TimezoneContextHolder.getTimezone()))
                .withZoneSameInstant(java.time.ZoneOffset.UTC)
                .toLocalDateTime();
    }
}
