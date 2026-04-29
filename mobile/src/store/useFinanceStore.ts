import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction, Budget, UserProfile } from '../types';

interface FinanceState {
  user: UserProfile | null;
  transactions: Transaction[];
  budgets: Budget[];
  totalBalance: number;
  isLoading: boolean;
  error: string | null;

  setUser: (user: UserProfile | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setBudgets: (budgets: Budget[]) => void;
  setTotalBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  transactions: [],
  budgets: [],
  totalBalance: 0,
  isLoading: false,
  error: null,
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),
      setBudgets: (budgets) => set({ budgets }),
      setTotalBalance: (balance) => set({ totalBalance: balance }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        transactions: state.transactions,
        budgets: state.budgets,
        totalBalance: state.totalBalance,
      }),
    },
  ),
);
