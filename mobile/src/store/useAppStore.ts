import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
// import apiClient from "../services/api"; // Removed to break require cycle
import { WalletResponse } from "../types/api";
import { Category } from "../hooks/useCategories";

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
  deduplicateMessages: () => void;
  
  // Active context
  activeWalletId: string | null;
  setActiveWalletId: (id: string | null) => void;

  // Metadata State
  wallets: WalletResponse[];
  categories: Category[];
  isMetadataLoading: boolean;
  refreshMetadata: () => Promise<void>;
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
      addMessage: (message) => set((state) => {
        const existingIndex = state.messages.findIndex(m => m.id === message.id);
        if (existingIndex !== -1) {
          // Logic Upsert: Nếu trùng ID, cập nhật tin nhắn cũ (Immutable)
          const newMessages = [...state.messages];
          newMessages[existingIndex] = message;
          return { messages: newMessages };
        }
        // Thêm mới nếu ID chưa tồn tại
        return { messages: [...state.messages, message] };
      }),
      updateLastMessage: (content) => set((state) => {
        const newMessages = [...state.messages];
        if (newMessages.length > 0) {
          const last = newMessages[newMessages.length - 1];
          newMessages[newMessages.length - 1] = { ...last, content };
        }
        return { messages: newMessages };
      }),
      clearChat: () => set({ messages: [] }),
      
      deduplicateMessages: () => set((state) => {
        try {
          if (state.messages.length === 0) return state;
          
          const startCount = state.messages.length;
          // Performance-optimized deduplication using Map (O(n))
          const uniqueEntries = new Map(state.messages.map(m => [m.id, m]));
          const uniqueMessages = Array.from(uniqueEntries.values());
          
          if (startCount !== uniqueMessages.length) {
            console.log(`[Storage] Deduplication: ${startCount} -> ${uniqueMessages.length} messages.`);
            return { messages: uniqueMessages };
          }
        } catch (error) {
          console.error("[Storage] Auto-deduplication failed:", error);
        }
        return state;
      }),

      // Wallet Context
      activeWalletId: null,
      setActiveWalletId: (id) => set({ activeWalletId: id }),

      // Metadata Implementation
      wallets: [],
      categories: [],
      isMetadataLoading: false,
      refreshMetadata: async () => {
        // This is now handled by src/services/metadataService.ts
        // Implementation left as placeholder to avoid breaking UI components
        console.warn("[Storage] refreshMetadata called from store. Use metadataService instead.");
      },
    }),
    {
      name: "smart-finance-storage",
      version: 3, // Increment to VERSION 3
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          console.log('[Storage] Rehydrated successfully. Running sanity check...');
          state.deduplicateMessages();
        }
      },
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          try {
            console.log(`[Storage] Migrating from version ${version} to 3...`);
            const messages = persistedState.messages || [];
            // Immediate cleanup during migration if possible
            const uniqueMessages = Array.from(new Map(messages.map((m: any) => [m.id, m])).values());
            return { ...persistedState, messages: uniqueMessages };
          } catch (e) {
            return persistedState;
          }
        }
        return persistedState;
      },
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
