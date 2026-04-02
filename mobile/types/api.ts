/**
 * Trình khớp chính xác cấu trúc ApiResponse<T> từ Backend Spring Boot.
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errorCode?: string;
  traceId?: string;
  path?: string;
  suggestion?: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Các lỗi nghiệp vụ phổ biến từ BE
 */
export enum AppErrorCode {
  UNAUTHORIZED = "AUTH_001",
  INSUFFICIENT_FUNDS = "WAL_002",
  TRANSACTION_NOT_FOUND = "TXN_001",
  AI_PROCESSING_ERROR = "AI_001",
}
