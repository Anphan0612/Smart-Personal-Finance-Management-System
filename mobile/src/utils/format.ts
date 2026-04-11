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
export const formatVND = (amount: number = 0, options: { 
  shorten?: boolean, 
  withSymbol?: boolean 
} = { shorten: false, withSymbol: true }) => {
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
