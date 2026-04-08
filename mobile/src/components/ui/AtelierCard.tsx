import React from "react";
import { View, type ViewProps } from "react-native";
import type { ElevationLevel } from "../../types";

interface AtelierCardProps extends ViewProps {
  elevation?: ElevationLevel;
  variant?: "default" | "gradient" | "outline" | "tertiary";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const elevationStyles: Record<ElevationLevel, string> = {
  lowest: "shadow-sm",
  low: "shadow-md",
  high: "shadow-lg",
};

const paddingStyles: Record<string, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const variantStyles: Record<string, string> = {
  default: "bg-surface-container-lowest",
  gradient: "bg-primary",
  tertiary: "bg-tertiary-container/10 border border-tertiary-container/20",
  outline: "bg-transparent border border-outline-variant",
};

export function AtelierCard({
  elevation = "low",
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: AtelierCardProps) {
  return (
    <View
      className={`rounded-atelier overflow-hidden ${elevationStyles[elevation]} ${variantStyles[variant]} ${paddingStyles[padding]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
