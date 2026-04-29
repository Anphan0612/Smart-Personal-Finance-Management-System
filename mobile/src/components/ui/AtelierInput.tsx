import React, { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { AtelierTypography } from './AtelierTypography';

interface AtelierInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isCurrency?: boolean;
  currencySymbol?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function AtelierInput({
  label,
  error,
  isCurrency = false,
  currencySymbol = '₫',
  leftIcon,
  rightIcon,
  className,
  onFocus,
  onBlur,
  ...props
}: AtelierInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? 'border-red-500'
    : isFocused
      ? 'border-primary'
      : 'border-neutral-200 dark:border-neutral-700';

  return (
    <View className={`gap-1.5 ${className ?? ''}`}>
      {label && (
        <AtelierTypography variant="label" className="ml-1">
          {label}
        </AtelierTypography>
      )}
      <View
        className={`flex-row items-center rounded-atelier-sm border-2 bg-surface-container-low dark:bg-surface-card/5 px-4 min-h-[48px] ${borderColor}`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        {isCurrency && (
          <AtelierTypography variant="body" className="mr-2 text-neutral-400">
            {currencySymbol}
          </AtelierTypography>
        )}
        <TextInput
          className="flex-1 text-base text-neutral-900 dark:text-neutral-50 font-inter-regular"
          placeholderTextColor="#74777f"
          style={{ color: '#181c22' }}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          {...props}
        />
      </View>
      {error && (
        <AtelierTypography variant="caption" className="text-red-500 ml-1">
          {error}
        </AtelierTypography>
      )}
    </View>
  );
}
