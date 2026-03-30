package com.example.smartmoneytracking.domain.entities.wallet.valueobject;

public enum WalletType {
    CASH("Tiền mặt"),
    BANK("Ngân hàng"),
    EWALLET("Ví điện tử"),
    INVESTMENT("Đầu tư");

    private final String displayName;

    WalletType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
