/**
 * High-performance local data caching utility.
 * Supports localStorage persistence with in-memory fallback, TTL expiration,
 * and instant cache invalidation on DB mutations.
 */

interface CacheItem<T> {
  timestamp: number;
  ttlMs: number;
  data: T;
}

class LocalCache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private PREFIX = 'vaily_pyro_cache_';

  /**
   * Get cached data if valid and within TTL limit.
   */
  get<T>(key: string): T | null {
    const fullKey = this.PREFIX + key;
    const now = Date.now();

    // 1. Check in-memory Map
    if (this.memoryCache.has(fullKey)) {
      const item = this.memoryCache.get(fullKey)!;
      if (now - item.timestamp < item.ttlMs) {
        return item.data as T;
      }
      this.memoryCache.delete(fullKey);
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(fullKey);
        if (raw) {
          const item: CacheItem<T> = JSON.parse(raw);
          if (now - item.timestamp < item.ttlMs) {
            // Restore to memory cache for fast secondary hits
            this.memoryCache.set(fullKey, item);
            return item.data;
          }
          // Expired - remove from localStorage
          window.localStorage.removeItem(fullKey);
        }
      } catch (err) {
        console.warn('LocalCache read error:', err);
      }
    }

    return null;
  }

  /**
   * Save data into cache with a specified TTL in milliseconds.
   * Default TTL: 10 minutes (600,000ms).
   */
  set<T>(key: string, data: T, ttlMs: number = 10 * 60 * 1000): void {
    const fullKey = this.PREFIX + key;
    const item: CacheItem<T> = {
      timestamp: Date.now(),
      ttlMs,
      data,
    };

    this.memoryCache.set(fullKey, item);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(fullKey, JSON.stringify(item));
      } catch (err) {
        console.warn('LocalCache write error (storage limit reached?):', err);
      }
    }
  }

  /**
   * Invalidate a specific cache key or all cache keys.
   */
  clear(key?: string): void {
    if (key) {
      const fullKey = this.PREFIX + key;
      this.memoryCache.delete(fullKey);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(fullKey);
        } catch (e) {}
      }
    } else {
      this.memoryCache.clear();
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          Object.keys(window.localStorage).forEach((k) => {
            if (k.startsWith(this.PREFIX)) {
              window.localStorage.removeItem(k);
            }
          });
        } catch (e) {}
      }
    }
  }
}

export const localCache = new LocalCache();
