import React from "react";
import {
  Pressable,
  ActivityIndicator,
  type PressableProps,
} from "react-native";
import * as Haptics from "expo-haptics";
import { AtelierTypography } from "./AtelierTypography";
import type { ButtonVariant } from "../../types";

interface AtelierButtonProps extends Omit<PressableProps, "children"> {
  variant?: ButtonVariant;
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantBaseStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-600",
  secondary: "bg-secondary active:bg-secondary-600",
  outline:
    "bg-transparent border-2 border-primary active:bg-primary-50 dark:active:bg-primary-900",
  link: "bg-transparent",
};

const variantTextColors: Record<ButtonVariant, string> = {
  primary: "#ffffff",
  secondary: "#ffffff",
  outline: "#1275e2",
  link: "#1275e2",
};

const sizeStyles: Record<string, string> = {
  sm: "py-2 px-4",
  md: "py-3 px-6",
  lg: "py-4 px-8",
};

export function AtelierButton({
  variant = "primary",
  label,
  loading = false,
  fullWidth = false,
  size = "md",
  onPress,
  disabled,
  className,
  ...props
}: AtelierButtonProps) {
  const handlePress = async (e: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <Pressable
      className={`rounded-atelier-sm items-center justify-center min-h-[48px] ${variantBaseStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${disabled || loading ? "opacity-50" : ""} ${className ?? ""}`}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variantTextColors[variant]}
          size="small"
        />
      ) : (
        <AtelierTypography
          variant="label"
          color={variantTextColors[variant]}
          className="text-sm tracking-wider"
        >
          {label}
        </AtelierTypography>
      )}
    </Pressable>
  );
}
