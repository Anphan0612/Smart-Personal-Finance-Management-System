import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_RESIZE_WIDTH = 1600;
const RESIZE_THRESHOLD_WIDTH = 4000;
const BLOCKED_MIN_FILE_SIZE_KB = 30;
const BLOCKED_MIN_DIMENSION = 400;
const WARNING_MIN_FILE_SIZE_KB = 80;
const WARNING_MIN_DIMENSION = 600;

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  fileSizeKB: number;
}

export interface QualityResult {
  isBlocked: boolean;
  blockReason?: string;
  hasWarning: boolean;
  warningMessage?: string;
}

const getFileSizeKB = async (uri: string): Promise<number> => {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || typeof info.size !== 'number') return 0;
  return Math.round(info.size / 1024);
};

export const processReceiptImage = async (
  uri: string,
  originalWidth: number,
  originalHeight: number
): Promise<ProcessedImage> => {
  const actions: ImageManipulator.Action[] =
    originalWidth > RESIZE_THRESHOLD_WIDTH ? [{ resize: { width: MAX_RESIZE_WIDTH } }] : [];

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    width: result.width ?? originalWidth,
    height: result.height ?? originalHeight,
    fileSizeKB: await getFileSizeKB(result.uri),
  };
};

export const validateImageQuality = (
  fileSizeKB: number,
  width: number,
  height: number
): QualityResult => {
  if (fileSizeKB < BLOCKED_MIN_FILE_SIZE_KB) {
    return {
      isBlocked: true,
      blockReason: 'Anh qua nho de OCR. Vui long chup lai gan hon va ro hon.',
      hasWarning: false,
    };
  }

  if (width < BLOCKED_MIN_DIMENSION || height < BLOCKED_MIN_DIMENSION) {
    return {
      isBlocked: true,
      blockReason: 'Do phan giai qua thap. Vui long chup lai voi khung hinh lon hon.',
      hasWarning: false,
    };
  }

  if (fileSizeKB < WARNING_MIN_FILE_SIZE_KB) {
    return {
      isBlocked: false,
      hasWarning: true,
      warningMessage: 'Anh co the thieu chi tiet. Ban nen chup lai de OCR chinh xac hon.',
    };
  }

  if (width < WARNING_MIN_DIMENSION || height < WARNING_MIN_DIMENSION) {
    return {
      isBlocked: false,
      hasWarning: true,
      warningMessage: 'Anh co kich thuoc nho. Ban co the chup lai gan hon de OCR tot hon.',
    };
  }

  return {
    isBlocked: false,
    hasWarning: false,
  };
};
