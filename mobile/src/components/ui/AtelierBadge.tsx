import React from "react";
import { View } from "react-native";
import { AtelierTypography } from "./AtelierTypography";

interface AtelierBadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const variantStyles: Record<string, string> = {
  default: "bg-neutral-100 dark:bg-neutral-800",
  success: "bg-green-100 dark:bg-green-900/30",
  warning: "bg-amber-100 dark:bg-amber-900/30",
  danger: "bg-red-100 dark:bg-red-900/30",
  info: "bg-primary-100 dark:bg-primary-900/30",
};

const variantTextColors: Record<string, string> = {
  default: "#74777f",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#1275e2",
};

export function AtelierBadge({
  label,
  variant = "default",
  size = "sm",
}: AtelierBadgeProps) {
  return (
    <View
      className={`self-start rounded-full ${variantStyles[variant]} ${size === "sm" ? "px-3 py-1" : "px-4 py-1.5"}`}
    >
      <AtelierTypography
        variant="caption"
        color={variantTextColors[variant]}
        className={size === "sm" ? "text-xs" : "text-sm"}
      >
        {label}
      </AtelierTypography>
    </View>
  );
}
