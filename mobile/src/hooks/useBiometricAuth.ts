import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  type?: 'biometric' | 'passcode';
}

/**
 * Custom hook for Biometric Authentication with Fallback
 * Follows PLAN-password-security-upgrade.md
 */
export const useBiometricAuth = () => {
  const authenticate = async (
    reason: string = 'Vui lòng xác thực để tiếp tục',
  ): Promise<BiometricAuthResult> => {
    try {
      // 1. Check if hardware supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback to Device Passcode if no biometrics enrolled
        console.log('[BIOMETRIC] Fallback to passcode (No hardware or enrollment)');
        return await authenticateWithPasscode(reason);
      }

      // 2. Attempt Biometric Authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Sử dụng mã PIN',
        disableDeviceFallback: false, // Allows system to use PIN if biometrics fail
        cancelLabel: 'Hủy',
      });

      if (result.success) {
        return { success: true, type: 'biometric' };
      }

      // Handle specific error cases if needed
      if (result.error === 'user_cancel' || result.error === 'app_cancel') {
        return { success: false, error: 'Người dùng đã hủy xác thực' };
      }

      return { success: false, error: 'Xác thực không thành công' };
    } catch (error: any) {
      console.error('[BIOMETRIC] Error:', error);
      return { success: false, error: error.message || 'Lỗi hệ thống khi xác thực' };
    }
  };

  const authenticateWithPasscode = async (reason: string): Promise<BiometricAuthResult> => {
    // Note: LocalAuthentication.authenticateAsync with disableDeviceFallback: false
    // already handles passcode fallback on most platforms.
    // This is an explicit fallback check.
    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

    if (securityLevel === LocalAuthentication.SecurityLevel.NONE) {
      Alert.alert(
        'Bảo mật yếu',
        'Thiết bị của bạn không có mật khẩu hoặc sinh trắc học. Vui lòng thiết lập khóa màn hình để sử dụng tính năng này.',
      );
      return { success: false, error: 'Thiết bị không có bảo mật' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
    });

    return {
      success: result.success,
      type: 'passcode',
      error: result.success ? undefined : 'Xác thực mã PIN thất bại',
    };
  };

  return { authenticate };
};
