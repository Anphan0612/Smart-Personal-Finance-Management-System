import axios, { AxiosError, AxiosResponse } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "../types/api";
import { useAppStore } from "../store/useAppStore";

const TOKEN_KEY = "auth_token";

// Tự động phân giải IP của máy chủ Expo đang chạy.
// debuggerHost sẽ trả về ví dụ: "192.168.1.5:8081" khi chạy development
const debuggerHost = Constants.expoConfig?.hostUri;
const lanIpAddress = debuggerHost?.split(":")[0];

// Ưu tiên dùng ENV nếu có cấu hình chuẩn. 
// Nếu không, trả về IP LAN tĩnh để cả máy thật & Emulator đều truy cập được.
// Fallback về 10.0.2.2 nếu hoàn toàn không tự detect được IP (rất hiếm).
const DYNAMIC_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (lanIpAddress ? `http://${lanIpAddress}:8080/api/v1` : "http://10.0.2.2:8080/api/v1");

// eslint-disable-next-line no-console
console.log(`[API CONFIG] Resolved Base URL: ${DYNAMIC_BASE_URL}`);

const apiClient = axios.create({
  baseURL: DYNAMIC_BASE_URL,
  timeout: 30000, // Tăng timeout cho AI processing
  headers: {
    "Content-Type": "application/json",
  },
});

// Fail fast with a clear error when API URL cannot be resolved.
if (!DYNAMIC_BASE_URL || typeof DYNAMIC_BASE_URL !== "string") {
  // eslint-disable-next-line no-console
  console.error("[API CONFIG] Missing EXPO_PUBLIC_API_URL and cannot infer LAN IP from Expo hostUri.");
}

apiClient.interceptors.request.use(async (config) => {
  const state = useAppStore.getState();
  const token = state.token;
  
  // Không gửi token cho các endpoint auth (Login/Register) để tránh Token nhiễu
  const isAuthPath = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");

  if (token && !isAuthPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    console.log(`[API RESPONSE] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest: any = error.config;
    const state = useAppStore.getState();

    // Log lỗi chi tiết để debug AI/Finance logic
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Xử lý Refresh Token khi gặp lỗi 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && state.refreshToken) {
      originalRequest._retry = true;
      console.log("[API] Access token expired, attempting refresh...");

      try {
        const response = await apiClient.post<ApiResponse<any>>("/auth/refresh-token", {}, {
          headers: { "Refresh-Token": state.refreshToken }
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        console.log("[API] Token refresh successful.");
        state.setTokens(accessToken, newRefreshToken);
        
        // Cập nhật Authorization header và thử lại request cũ
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[API] Refresh token failed, logging out...", refreshError);
        state.setTokens(null, null);
        // Resetting tokens will trigger the Auth Guard in app/_layout.tsx
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper để bóc tách `data` từ `ApiResponse<T>` một cách an toàn.
 * Sử dụng với TanStack Query.
 */
export const fetcher = async <T>(url: string, config = {}): Promise<T> => {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
};

export const poster = async <T, D>(url: string, data: D): Promise<T> => {
  console.log(`[POSTER] Calling: ${url}`);
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    console.log(`[POSTER] Success: ${url}, Data keys:`, Object.keys(response.data.data || {}));
    return response.data.data;
  } catch (error) {
    console.error(`[POSTER] Error: ${url}`, error);
    throw error;
  }
};

export default apiClient;
