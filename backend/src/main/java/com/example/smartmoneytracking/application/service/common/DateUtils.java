package com.example.smartmoneytracking.application.service.common;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

public class DateUtils {

    /**
     * Normalizes an OffsetDateTime to UTC and truncates to milliseconds.
     */
    public static OffsetDateTime normalize(OffsetDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.withOffsetSameInstant(ZoneOffset.UTC)
                .truncatedTo(ChronoUnit.MILLIS);
    }

    /**
     * Returns the current time in the user's timezone as a ZonedDateTime.
     */
    public static ZonedDateTime nowInUserTz() {
        return ZonedDateTime.now(ZoneId.of(TimezoneContextHolder.getTimezone()));
    }

    /**
     * Converts a localized time to UTC OffsetDateTime for database storage/querying.
     */
    public static OffsetDateTime toUtc(ZonedDateTime zonedDateTime) {
        return normalize(zonedDateTime.toOffsetDateTime());
    }
    
    /**
     * Gets the start of the current day in the user's timezone, converted to UTC.
     */
    public static OffsetDateTime getStartOfTodayInUtc() {
        ZonedDateTime localStart = nowInUserTz().toLocalDate().atStartOfDay(ZoneId.of(TimezoneContextHolder.getTimezone()));
        return toUtc(localStart);
    }

    /**
     * Converts an OffsetDateTime to UTC for storage.
     */
    public static OffsetDateTime localToUtc(OffsetDateTime offsetDateTime) {
        return normalize(offsetDateTime);
    }

    /**
     * Returns current time in UTC, truncated to milliseconds.
     */
    public static OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC).truncatedTo(ChronoUnit.MILLIS);
    }

    /**
     * Returns current time in user's local timezone.
     */
    public static OffsetDateTime nowLocal() {
        return OffsetDateTime.now(ZoneId.of(TimezoneContextHolder.getTimezone()));
    }
}
