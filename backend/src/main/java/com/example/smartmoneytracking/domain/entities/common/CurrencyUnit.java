package com.example.smartmoneytracking.domain.entities.common;

/**
 * Currency metadata for display preferences.
 */
public enum CurrencyUnit {
    USD("USD", "$"),
    VND("VND", "₫"),
    EUR("EUR", "€");

    private final String code;
    private final String symbol;

    CurrencyUnit(String code, String symbol) {
        this.code = code;
        this.symbol = symbol;
    }

    public String getCode() { return code; }
    public String getSymbol() { return symbol; }
}
