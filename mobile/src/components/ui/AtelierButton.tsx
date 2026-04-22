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
  elevated: "bg-surface-container-low active:bg-surface-container",
  default: "bg-surface-container active:bg-surface-container-low",
  gradient: "bg-primary active:bg-primary-600",
  tertiary: "bg-tertiary active:bg-tertiary-600",
  error: "bg-red-500 active:bg-red-600",
};

const variantTextColors: Record<ButtonVariant, string> = {
  primary: "#ffffff",
  secondary: "#ffffff",
  outline: "#1275e2",
  link: "#1275e2",
  elevated: "#181c22",
  default: "#181c22",
  gradient: "#ffffff",
  tertiary: "#ffffff",
  error: "#ffffff",
};

const sizeStyles: Record<string, string> = {
  sm: "py-2 px-4",
  md: "py-3 px-6",
  lg: "py-4 px-8",
};

import { LinearGradient } from "expo-linear-gradient";

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

  const isGradient = variant === "gradient";

  return (
    <Pressable
      className={`rounded-2xl items-center justify-center min-h-[48px] overflow-hidden ${!isGradient ? variantBaseStyles[variant] : ""} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${disabled || loading ? "opacity-50" : ""} ${className ?? ""}`}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
    >
      {isGradient && (
        <LinearGradient
          colors={['#005ab4', '#003d9b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />
      )}
      {loading ? (
        <ActivityIndicator
          color={variantTextColors[variant]}
          size="small"
        />
      ) : (
        <AtelierTypography
          variant="label"
          color={variantTextColors[variant]}
          className="text-sm tracking-widest font-black"
        >
          {label}
        </AtelierTypography>
      )}
    </Pressable>
  );
}
