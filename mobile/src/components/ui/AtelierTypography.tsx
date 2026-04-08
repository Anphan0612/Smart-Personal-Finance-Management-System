import React from "react";
import { Text, type TextProps } from "react-native";
import type { TypographyVariant } from "../../types";

interface AtelierTypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  children: React.ReactNode;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: "text-4xl font-manrope font-extrabold tracking-tighter",
  h2: "text-3xl font-manrope font-bold tracking-tight",
  h3: "text-xl font-manrope font-bold",
  body: "text-base font-inter font-normal leading-relaxed",
  caption: "text-sm font-inter text-surface-on-variant",
  label: "text-xs font-manrope font-bold uppercase tracking-widest",
};

export function AtelierTypography({
  variant = "body",
  color,
  className,
  style,
  children,
  ...props
}: AtelierTypographyProps) {
  return (
    <Text
      className={`${variantStyles[variant]} ${className ?? ""}`}
      style={[color ? { color } : undefined, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
