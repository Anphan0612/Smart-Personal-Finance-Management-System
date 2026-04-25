import { useState, useRef, useCallback, useEffect } from 'react';
import apiClient from '../../../services/api';
import { Alert } from 'react-native';
import { router } from 'expo-router';

type ReceiptStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'CONFIRMED' | 'FAILED';

interface UseOcrPollingOptions {
  onStatusChange?: (status: ReceiptStatus) => void;
  onComplete?: (receiptId: string) => void;
  onError?: (error: any) => void;
  pollingInterval?: number;
  maxRetries?: number;
}

export const useOcrPolling = (options?: UseOcrPollingOptions) => {
  const [isPolling, setIsPolling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ReceiptStatus | null>(null);
  const isCancelledRef = useRef(false);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const pollingInterval = options?.pollingInterval || 3000;
  const maxRetries = options?.maxRetries || 10;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setIsPolling(false);
    isCancelledRef.current = true;
  }, []);

  const pollReceipt = useCallback(
    async (receiptId: string) => {
      if (isCancelledRef.current) return;

      try {
        const response = await apiClient.get(`/receipts/${receiptId}`);

        if (response.data.success && !isCancelledRef.current) {
          const status: ReceiptStatus = response.data.data.status;
          setCurrentStatus(status);
          options?.onStatusChange?.(status);

          if (status === 'PROCESSED' || status === 'CONFIRMED') {
            stopPolling();
            options?.onComplete?.(receiptId);
            return;
          } else if (status === 'FAILED') {
            stopPolling();
            Alert.alert('Lỗi', 'AI không thể xử lý hóa đơn này.');
            return;
          }

          // Continue polling if still processing
          retryCountRef.current = 0; // Reset retry count on successful response
          pollingTimerRef.current = setTimeout(() => pollReceipt(receiptId), pollingInterval);
        }
      } catch (error: any) {
        if (isCancelledRef.current) return;

        const status = error.response?.status;

        // Handle auth errors
        if (status === 401 || status === 403) {
          stopPolling();
          Alert.alert('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại.');
          router.replace('/(auth)/login');
          return;
        }

        // Handle network errors with retry
        retryCountRef.current++;
        if (retryCountRef.current >= maxRetries) {
          stopPolling();
          Alert.alert(
            'Lỗi kết nối',
            'Mạng không ổn định. Vui lòng kiểm tra lại sau trong danh sách giao dịch.'
          );
          options?.onError?.(error);
          return;
        }

        // Retry with exponential backoff
        const backoffDelay = pollingInterval * Math.min(retryCountRef.current, 3);
        pollingTimerRef.current = setTimeout(() => pollReceipt(receiptId), backoffDelay);
      }
    },
    [options, pollingInterval, maxRetries, stopPolling]
  );

  const startPolling = useCallback(
    (receiptId: string) => {
      if (isCancelledRef.current) return;

      isCancelledRef.current = false;
      retryCountRef.current = 0;
      setIsPolling(true);
      pollReceipt(receiptId);
    },
    [pollReceipt]
  );

  return {
    isPolling,
    currentStatus,
    startPolling,
    stopPolling,
  };
};
