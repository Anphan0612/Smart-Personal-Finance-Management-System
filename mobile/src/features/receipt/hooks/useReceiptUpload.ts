import { useState, useRef, useCallback, useEffect } from 'react';
import apiClient from '../../../services/api';
import { Alert } from 'react-native';
import { router } from 'expo-router';

interface UseReceiptUploadOptions {
  onUploadSuccess?: (receiptId: string) => void;
  onUploadError?: (error: any) => void;
}

export const useReceiptUpload = (options?: UseReceiptUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  const uploadReceipt = useCallback(
    async (imageUri: string) => {
      if (isCancelledRef.current) return null;

      setIsUploading(true);

      try {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: imageUri,
          name: 'receipt.jpg',
          type: 'image/jpeg',
        });

        const response = await apiClient.post('/receipts/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success && !isCancelledRef.current) {
          const receiptId = response.data.data.id;
          options?.onUploadSuccess?.(receiptId);
          return receiptId;
        }

        return null;
      } catch (error) {
        if (!isCancelledRef.current) {
          options?.onUploadError?.(error);
          Alert.alert(
            'Lỗi Upload',
            'Không thể tải ảnh lên máy chủ. Vui lòng kiểm tra kết nối mạng.'
          );
        }
        return null;
      } finally {
        if (!isCancelledRef.current) {
          setIsUploading(false);
        }
      }
    },
    [options]
  );

  return {
    isUploading,
    uploadReceipt,
  };
};
