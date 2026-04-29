/**
 * Utility functions for formatting data in the mobile application.
 */

/**
 * Formats a number as VNĐ (Vietnamese Đồng).
 * Handles rounding to integers and provides consistent separators.
 *
 * @param amount - The numerical value to format.
 * @param options - Formatting options.
 * @returns A formatted string e.g., "1.500.000đ"
 */
export const formatVND = (
  amount: number = 0,
  options: {
    shorten?: boolean;
    withSymbol?: boolean;
  } = { shorten: false, withSymbol: true },
) => {
  const absAmount = Math.abs(amount);

  // Logic for intelligent shortening (only for very large numbers if enabled)
  if (options.shorten) {
    if (absAmount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} tỷ${options.withSymbol ? 'đ' : ''}`;
    }
    if (absAmount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')} tr${options.withSymbol ? 'đ' : ''}`;
    }
  }

  // Standard format: 1.500.000
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return options.withSymbol ? `${formatted}đ` : formatted;
};

/**
 * Parses a formatted currency string back to a pure number.
 * e.g., "1.500.000" -> 1500000
 */
export const parseVND = (value: string = '0'): number => {
  if (!value) return 0;
  // Remove dots, commas and currency symbols
  const cleanValue = value.replace(/[đ\. ,]/g, '');
  return parseInt(cleanValue, 10) || 0;
};

/**
 * Shorthand for formatVND with symbol and no shortening for standard lists.
 */
export const formatCurrency = (amount: number = 0) => formatVND(amount);

/**
 * Formats a raw string of numbers into a partitioned currency string for live inputs.
 * e.g., "100000" -> "100.000"
 */
export const formatLiveCurrency = (value: string): string => {
  if (!value) return '';
  const numericValue = value.replace(/\D/g, '');
  if (!numericValue) return '';
  return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue, 10));
};

/**
 * Robustly parses any currency string back to number.
 */
export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const numericString = value.replace(/\D/g, '');
  return parseInt(numericString, 10) || 0;
};

/**
 * Formats a date string (ISO 8601) into a localized Vietnamese format.
 * Uses 24h format and vi-VN locale.
 * e.g., "2026-04-23T14:30:00+07:00" -> "14:30, 23/04/2026"
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  })
    .format(date)
    .replace(',', ''); // Standardize format
};

/**
 * Formats a date string into a time-only string (24h).
 * e.g., "14:30"
 */
export const formatTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Formats a date string into a date-only string.
 * e.g., "23/04/2026"
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
