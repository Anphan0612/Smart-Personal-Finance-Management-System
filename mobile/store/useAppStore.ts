import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  hasCard?: boolean;
  hasProgress?: boolean;
  transactionData?: {
    amount: number;
    category: string;
    type: string;
    date: string;
    note: string;
    confidence: number;
    categoryId?: string;
  };
  // Query history results
  hasQueryResult?: boolean;
  queryData?: {
    summary: any;
    matchedTransactions: any[];
    filters: any;
  };
  // Anomaly detection results
  hasAnomaly?: boolean;
  anomalyData?: {
    anomalies: any[];
    totalChecked: number;
  };
}

interface UserInfo {
  name: string | null;
  email: string | null;
}

interface AppState {
  // Auth State
  token: string | null;
  refreshToken: string | null;
  user: UserInfo;
  setToken: (token: string | null) => void;
  setTokens: (token: string | null, refreshToken: string | null, user?: UserInfo) => void;
  logout: () => Promise<void>;

  // UI State
  isTransactionModalOpen: boolean;
  setTransactionModalOpen: (open: boolean) => void;
  
  // AI Chat State
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearChat: () => void;
  
  // Active context
  activeWalletId: string | null;
  setActiveWalletId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth Defaults
      token: null,
      refreshToken: null,
      user: { name: null, email: null },
      setToken: (token) => set({ token }),
      setTokens: (token, refreshToken, user) => set({ 
        token, 
        refreshToken, 
        user: user || { name: null, email: null } 
      }),
      logout: async () => {
        await SecureStore.deleteItemAsync("auth_token");
        set({ 
          token: null, 
          refreshToken: null, 
          user: { name: null, email: null }, 
          activeWalletId: null,
          messages: [] 
        });
      },

      // UI Defaults
      isTransactionModalOpen: false,
      setTransactionModalOpen: (open) => set({ isTransactionModalOpen: open }),
      
      // AI Chat Defaults
      messages: [],
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      updateLastMessage: (content) => set((state) => {
        const newMessages = [...state.messages];
        if (newMessages.length > 0) {
          const last = newMessages[newMessages.length - 1];
          newMessages[newMessages.length - 1] = { ...last, content };
        }
        return { messages: newMessages };
      }),
      clearChat: () => set({ messages: [] }),
      
      // Wallet Context
      activeWalletId: null,
      setActiveWalletId: (id) => set({ activeWalletId: id }),
    }),
    {
      name: "smart-finance-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        token: state.token, 
        refreshToken: state.refreshToken, 
        user: state.user,
        messages: state.messages, 
        activeWalletId: state.activeWalletId 
      }),
    }
  )
);
