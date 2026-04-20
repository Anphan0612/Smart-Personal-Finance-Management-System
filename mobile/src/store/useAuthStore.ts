import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setToken: (token: string | null) => void;
  loadToken: () => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = "auth_token";

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ token, isAuthenticated: true });
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ token: null, isAuthenticated: false });
    }
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      set({
        token,
        isAuthenticated: !!token,
        isLoading: false,
      });
    } catch {
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },
}));
