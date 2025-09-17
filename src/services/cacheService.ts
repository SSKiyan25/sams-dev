/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private DEFAULT_TTL = 60 * 60 * 1000; // 1 hour default TTL

  private constructor() {
    // Initialize from localStorage if available
    try {
      const savedCache = localStorage.getItem("app-data-cache");
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheEntry<any>);
        });
      }
    } catch (error) {
      console.error("Failed to load cache from localStorage", error);
    }
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Save cache to localStorage
  private saveToStorage(): void {
    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      localStorage.setItem("app-data-cache", JSON.stringify(cacheObject));
    } catch (error) {
      console.error("Failed to save cache to localStorage", error);
    }
  }

  // Get data from cache or fetch it
  public async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check if we have valid cache
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      console.log(`Cache hit for ${key}`);
      return cached.data as T;
    }

    // No valid cache, fetch data
    console.log(`Cache miss for ${key}, fetching data...`);
    const data = await fetchFn();

    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });

    this.saveToStorage();
    return data;
  }

  // Manually set cache
  public set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
    this.saveToStorage();
  }

  // Invalidate specific cache entry
  public invalidate(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  // Invalidate cache entries by prefix
  public invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  // Clear entire cache
  public clear(): void {
    this.cache.clear();
    localStorage.removeItem("app-data-cache");
  }

  // Get cache stats
  public getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalSizeKB: this.estimateCacheSizeKB(),
    };
  }

  private estimateCacheSizeKB(): number {
    try {
      const cacheString = JSON.stringify(
        Object.fromEntries(this.cache.entries())
      );
      return Math.round(cacheString.length / 1024);
    } catch (e) {
      return 0;
    }
  }
}

export const cacheService = CacheService.getInstance();

// Cache durations
export const CACHE_DURATIONS = {
  PROGRAMS: 24 * 60 * 60 * 1000, // 24 hours
  USERS: 60 * 60 * 1000, // 1 hour
  EVENTS: 15 * 60 * 1000, // 15 minutes
  ATTENDANCE: 5 * 60 * 1000, // 5 minutes
  SEARCH_RESULTS: 2 * 60 * 1000, // 2 minutes
  DASHBOARD: {
    STATS: 5 * 60 * 1000, // 5 minutes
    ONGOING_EVENTS: 60 * 1000, // 1 minute (since status changes frequently)
    UPCOMING_EVENTS: 15 * 60 * 1000, // 15 minutes
    RECENT_MEMBERS: 30 * 60 * 1000, // 30 minutes
  },
};
