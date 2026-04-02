import axios, { AxiosError, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "../types/api";
import { useAppStore } from "../store/useAppStore";

const TOKEN_KEY = "auth_token";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080/api/v1",
  timeout: 30000, // Tăng timeout cho AI processing
  headers: {
    "Content-Type": "application/json",
  },
});

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
        // Có thể redirect về login ở đây nếu cần (mobile router)
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
