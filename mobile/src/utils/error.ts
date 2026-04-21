import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Centralized error handling utility for API errors.
 * Extracts error message, shows Alert, logs to console, and triggers haptic feedback.
 *
 * @param error - The error object (typically from axios/fetch)
 * @param title - Optional custom alert title (default: 'Lỗi')
 * @param fallbackMessage - Optional fallback message if error has no message
 * @returns The extracted error message string
 */
export function handleApiError(
  error: any,
  title: string = 'Lỗi',
  fallbackMessage: string = 'Đã xảy ra lỗi. Vui lòng thử lại.'
): string {
  // Extract error message with fallback chain
  const errorMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

  // Log to console with context
  console.error(`[${title}]`, {
    message: errorMessage,
    status: error?.response?.status,
    data: error?.response?.data,
    originalError: error,
  });

  // Trigger error haptics
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  // Show alert to user
  Alert.alert(title, errorMessage);

  return errorMessage;
}

/**
 * Variant for success scenarios with haptic feedback only.
 * Use when you want consistent success feedback without Alert.
 */
export function triggerSuccessHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Variant for warning scenarios.
 */
export function handleWarning(
  message: string,
  title: string = 'Cảnh báo'
): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  Alert.alert(title, message);
}
