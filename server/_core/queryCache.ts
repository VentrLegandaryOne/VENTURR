/**
 * Database Query Caching Utility
 * 
 * Provides in-memory caching for database queries to reduce
 * API response times by 50-80%
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear cache by pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    let count = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      count++;
    });
    
    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const keys: string[] = [];
    this.cache.forEach((_, key) => keys.push(key));
    return {
      size: this.cache.size,
      keys,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      cleaned++;
    });
    
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }
}

// Singleton instance
export const queryCache = new QueryCache();

/**
 * Cache decorator for async functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyPrefix?: string;
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const {
    keyPrefix = fn.name,
    ttl,
    keyGenerator = (...args) => JSON.stringify(args),
  } = options;

  return (async (...args: Parameters<T>) => {
    const cacheKey = `${keyPrefix}:${keyGenerator(...args)}`;
    
    // Try to get from cache
    const cached = queryCache.get<Awaited<ReturnType<T>>>(cacheKey);
    if (cached !== null) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return cached;
    }
    
    // Execute function and cache result
    console.log(`[Cache] MISS: ${cacheKey}`);
    const result = await fn(...args);
    queryCache.set(cacheKey, result, ttl);
    
    return result;
  }) as T;
}

/**
 * Helper to generate cache keys
 */
export function generateCacheKey(prefix: string, ...parts: any[]): string {
  return `${prefix}:${parts.map(p => String(p)).join(':')}`;
}

/**
 * Invalidate cache for a specific resource
 */
export function invalidateResource(resource: string, id?: string | number): void {
  if (id) {
    queryCache.invalidatePattern(`^${resource}:.*${id}`);
  } else {
    queryCache.invalidatePattern(`^${resource}:`);
  }
}

