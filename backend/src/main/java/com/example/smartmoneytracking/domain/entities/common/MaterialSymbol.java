package com.example.smartmoneytracking.domain.entities.common;

/**
 * Common Material Symbols derived from high-fidelity UI design.
 */
public enum MaterialSymbol {
    HOME,
    RESTAURANT,
    COFFEE,
    PAYMENTS,
    SHOPPING_BAG,
    DIRECTIONS_CAR,
    GROCERY,
    CELEBRATION,
    WORK,
    SAVINGS,
    ANALYTICS,
    PERSON,
    NOTIFICATIONS,
    LIST,
    RECEIPT_LONG,
    // New additions for expanded category support
    HEALTH,              // Healthcare
    SCHOOL,              // Education
    BOLT,                // Utilities
    HOME_REPAIR,         // Household
    RESTAURANT_MENU,     // Food & Dining
    CARD_GIFTCARD,       // Gift
    MORE_HORIZ;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static MaterialSymbol fromString(String value) {
        if (value == null) return LIST;
        try {
            return MaterialSymbol.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LIST;
        }
    }
}
