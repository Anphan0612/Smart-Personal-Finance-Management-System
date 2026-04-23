import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse } from '@/types/api';
import { useAppStore } from '@/store/useAppStore';
import * as Localization from 'expo-localization';

const TOKEN_KEY = 'auth_token';

// Tự động phân giải IP của máy chủ Expo đang chạy.
// debuggerHost sẽ trả về ví dụ: "192.168.1.5:8081" khi chạy development
const debuggerHost = Constants.expoConfig?.hostUri;
const lanIpAddress = debuggerHost?.split(':')[0];

// Ưu tiên dùng ENV nếu có cấu hình chuẩn.
// Nếu không, trả về IP LAN tĩnh để cả máy thật & Emulator đều truy cập được.
// Fallback về 10.0.2.2 nếu hoàn toàn không tự detect được IP (rất hiếm).
export const DYNAMIC_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (lanIpAddress ? `http://${lanIpAddress}:8080/api/v1` : 'http://10.0.2.2:8080/api/v1');

// eslint-disable-next-line no-console
console.log(`[API CONFIG] 🌐 API URL: ${DYNAMIC_BASE_URL}`);
if (!process.env.EXPO_PUBLIC_API_URL && lanIpAddress) {
  // eslint-disable-next-line no-console
  console.log(`[API CONFIG] 🚀 Auto-detected LAN IP: ${lanIpAddress}`);
}

export const apiClient = axios.create({
  baseURL: DYNAMIC_BASE_URL,
  timeout: 30000, // Response is now immediate (202 Accepted), polling handles the rest
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fail fast with a clear error when API URL cannot be resolved.
if (!DYNAMIC_BASE_URL || typeof DYNAMIC_BASE_URL !== 'string') {
  // eslint-disable-next-line no-console
  console.error(
    '[API CONFIG] Missing EXPO_PUBLIC_API_URL and cannot infer LAN IP from Expo hostUri.',
  );
}

apiClient.interceptors.request.use(async (config) => {
  // Access store INSIDE the interceptor to break static cycles and avoid race conditions
  const state = useAppStore.getState();
  const token = state.token;

  // Không gửi token cho các endpoint auth (Login/Register) để tránh Token nhiễu
  const isAuthPath =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/auth/refresh-token');

  if (token && !isAuthPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject Timezone for localized reporting
  const timezone = Localization.getCalendars()[0]?.timeZone || 'UTC';
  config.headers['X-Timezone'] = timezone;

  return config;
});

// ─── Refresh Token Mutex ─────────────────────────────────────────────
// Prevents race conditions when multiple requests receive 401 simultaneously.
// Only ONE refresh call is made; all others queue up and wait for the result.
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest: any = error.config;

    // Log lỗi chi tiết để debug AI/Finance logic
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.message || error.message,
    });

    // ─── 401 Handling with Mutex ───
    if (error.response?.status === 401 && !originalRequest._retry) {
      const state = useAppStore.getState();

      // If no refresh token exists at all, clear session and bail immediately
      if (!state.refreshToken) {
        console.warn('[API] No refresh token available. Clearing session.');
        state.setTokens(null, null);
        return Promise.reject(error);
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        console.log('[API] Refresh in progress, queuing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest._retry = true;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      // This is the FIRST 401 → take the lock and refresh
      originalRequest._retry = true;
      isRefreshing = true;
      console.log('[API] Access token expired, attempting refresh (mutex locked)...');

      try {
        const response = await apiClient.post<ApiResponse<any>>(
          '/auth/refresh-token',
          {},
          {
            headers: { 'Refresh-Token': state.refreshToken },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        console.log('[API] Token refresh successful. Draining queue...');
        state.setTokens(accessToken, newRefreshToken);

        // Drain all queued requests with the new token
        processQueue(null, accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[API] Refresh token failed. Clearing session & draining queue with error.');
        state.setTokens(null, null);
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Helper để bóc tách `data` từ `ApiResponse<T>` một cách an toàn.
 * Sử dụng với TanStack Query.
 */
export const fetcher = async <T>(url: string, config: any = {}): Promise<T> => {
  const method = config.method?.toLowerCase() || 'get';
  const response = await apiClient.request<ApiResponse<T>>({
    url,
    ...config,
    method,
  });
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

export const putter = async <T, D>(url: string, data: D): Promise<T> => {
  console.log(`[PUTTER] Calling: ${url}`);
  try {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    console.log(`[PUTTER] Success: ${url}, Data keys:`, Object.keys(response.data.data || {}));
    return response.data.data;
  } catch (error) {
    console.error(`[PUTTER] Error: ${url}`, error);
    throw error;
  }
};

export default apiClient;
