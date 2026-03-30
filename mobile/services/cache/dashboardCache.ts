import AsyncStorage from '@react-native-async-storage/async-storage';
import {LRUCache} from 'lru-cache';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ASYNC_STORAGE_KEY = 'dashboard_cache';

class DashboardCache {
  private memoryCache: LRUCache<string, CacheEntry<any>>;

  constructor() {
    this.memoryCache = new LRUCache({
      max: 10, // Maximum 10 entries
      ttl: CACHE_TTL,
    });
  }

  private getCacheKey(key: string, timeRange?: string): string {
    return timeRange ? `${key}_${timeRange}` : key;
  }

  async get<T>(key: string, timeRange?: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(key, timeRange);

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (memoryEntry && Date.now() - memoryEntry.timestamp < CACHE_TTL) {
      return memoryEntry.data;
    }

    // Check persistent cache
    try {
      const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      if (stored) {
        const cacheData = JSON.parse(stored);
        const entry = cacheData[cacheKey] as CacheEntry<T> | undefined;
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
          // Restore to memory cache
          this.memoryCache.set(cacheKey, entry);
          return entry.data;
        }
      }
    } catch (error) {
      console.warn('Failed to read from persistent cache:', error);
    }

    return null;
  }

  async set<T>(key: string, data: T, timeRange?: string): Promise<void> {
    const cacheKey = this.getCacheKey(key, timeRange);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    // Set in memory cache
    this.memoryCache.set(cacheKey, entry);

    // Set in persistent cache
    try {
      const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      const cacheData = stored ? JSON.parse(stored) : {};
      cacheData[cacheKey] = entry;
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to write to persistent cache:', error);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error);
    }
  }

  // Specific cache methods for dashboard data
  async getSummary(timeRange: string) {
    return this.get('summary', timeRange);
  }

  async setSummary(data: any, timeRange: string) {
    return this.set('summary', data, timeRange);
  }

  async getMonthlyTrend(timeRange: string) {
    return this.get('monthlyTrend', timeRange);
  }

  async setMonthlyTrend(data: any, timeRange: string) {
    return this.set('monthlyTrend', data, timeRange);
  }

  async getCategoryBreakdown(timeRange: string) {
    return this.get('categoryBreakdown', timeRange);
  }

  async setCategoryBreakdown(data: any, timeRange: string) {
    return this.set('categoryBreakdown', data, timeRange);
  }

  async getTransactions() {
    return this.get('transactions');
  }

  async setTransactions(data: any) {
    return this.set('transactions', data);
  }
}

export const dashboardCache = new DashboardCache();