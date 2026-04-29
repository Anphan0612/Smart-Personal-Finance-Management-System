import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { poster } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { BudgetResponse } from '../types/api';

// ─── Storage Key Conventions ──────────────────────────────────────────
const AI_INSIGHT_KEY = (categoryId: string, dateKey: string) =>
  `ai:budgetInsight:${categoryId}:${dateKey}`;
const AI_DISMISSED_KEY = (categoryId: string, dateKey: string) =>
  `ai:dismissed:${categoryId}:${dateKey}`;

const getLocalDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// ─── Types ────────────────────────────────────────────────────────────
export interface BudgetInsightResult {
  categoryId: string;
  categoryName: string;
  percentageUsed: number;
  overspentAmount: number;
  aiInsight: string;
}

// ─── AsyncStorage Helpers ─────────────────────────────────────────────
async function getCachedInsight(categoryId: string, dateKey: string): Promise<BudgetInsightResult | null> {
  try {
    const raw = await AsyncStorage.getItem(AI_INSIGHT_KEY(categoryId, dateKey));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setCachedInsight(categoryId: string, dateKey: string, data: BudgetInsightResult) {
  try {
    await AsyncStorage.setItem(AI_INSIGHT_KEY(categoryId, dateKey), JSON.stringify(data));
  } catch {
    // Silent fail for cache writes
  }
}

async function isDismissedToday(categoryId: string, dateKey: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(AI_DISMISSED_KEY(categoryId, dateKey))) === '1';
  } catch {
    return false;
  }
}

export async function dismissInsight(categoryId: string) {
  const dateKey = getLocalDateKey();
  await AsyncStorage.setItem(AI_DISMISSED_KEY(categoryId, dateKey), '1');
}

// ─── Hook: useBudgetInsight ───────────────────────────────────────────
/**
 * Declarative hook to fetch AI budget insights for the most critical budget.
 *
 * Architecture:
 * 1. Finds the most critical budget (OVERBUDGET > DANGER).
 * 2. Checks AsyncStorage ONCE per categoryId for cached insight + dismiss status.
 * 3. If no cache: fetches from `/ai/budget-insight` via React Query.
 * 4. On success: persists to AsyncStorage.
 * 5. React Query's deduplication + ref-gated async check prevents double calls.
 */
export const useBudgetInsight = (budgets: BudgetResponse[] | undefined) => {
  const token = useAppStore((state) => state.token);
  const queryClient = useQueryClient();
  const dateKey = getLocalDateKey();

  // Derive the critical budget
  const critical = budgets?.find(
    (b) => b.thresholdStatus === 'OVERBUDGET' || b.thresholdStatus === 'DANGER',
  ) ?? null;

  const categoryId = critical?.categoryId ?? null;

  // Track dismiss state + readiness
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  // Ref guard: prevent the async check from running multiple times for the same categoryId
  const checkedCategoryRef = useRef<string | null>(null);

  // Pre-check AsyncStorage ONCE per unique categoryId
  useEffect(() => {
    if (!categoryId) {
      setReady(false);
      setDismissed(false);
      checkedCategoryRef.current = null;
      return;
    }

    // Skip if we already checked this exact categoryId
    if (checkedCategoryRef.current === categoryId) return;
    checkedCategoryRef.current = categoryId;

    let cancelled = false;

    (async () => {
      const [wasDismissed, cached] = await Promise.all([
        isDismissedToday(categoryId, dateKey),
        getCachedInsight(categoryId, dateKey),
      ]);

      if (cancelled) return;

      setDismissed(wasDismissed);

      // If we have a cached insight, seed React Query's cache directly
      if (cached) {
        queryClient.setQueryData(['ai', 'budgetInsight', { categoryId, dateKey }], cached);
      }

      setReady(true);
    })();

    return () => { cancelled = true; };
  }, [categoryId, dateKey, queryClient]);

  // Declarative trigger: only fetch when all conditions are met
  const shouldFetch = ready && !!categoryId && !!token && !dismissed;

  const query = useQuery({
    queryKey: ['ai', 'budgetInsight', { categoryId, dateKey }],
    queryFn: async (): Promise<BudgetInsightResult> => {
      const result = await poster<{ insight: string }, any>('/ai/budget-insight', {
        category_name: critical!.categoryName,
        threshold: critical!.thresholdStatus,
      });

      const insightData: BudgetInsightResult = {
        categoryId: critical!.categoryId!,
        categoryName: critical!.categoryName,
        percentageUsed: critical!.percentageUsed,
        overspentAmount: Math.abs(critical!.remainingAmount),
        aiInsight: result.insight,
      };

      // Persist to AsyncStorage on successful fetch
      await setCachedInsight(critical!.categoryId!, dateKey, insightData);

      return insightData;
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours — won't refetch during the session
    gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collection cache for 24h
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const data = query.data ?? null;

  // Derive alert visibility: has data AND not dismissed AND ready
  const alertVisible = ready && !!data && !dismissed;

  const handleDismiss = async () => {
    if (categoryId) {
      await dismissInsight(categoryId);
      setDismissed(true);
    }
  };

  return {
    data,
    isLoading: !ready || query.isLoading,
    isError: query.isError,
    alertVisible,
    handleDismiss,
  };
};
