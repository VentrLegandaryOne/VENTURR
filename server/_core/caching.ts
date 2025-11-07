/**
 * Redis Caching Layer
 * Provides distributed caching for sessions, queries, and API responses
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

/**
 * In-memory cache implementation (fallback when Redis is unavailable)
 * For production, integrate with actual Redis client
 */
class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    });

    this.stats.sets++;
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get multiple values from cache
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }

  /**
   * Set multiple values in cache
   */
  async mset<T>(entries: Record<string, T>, ttlSeconds: number = 3600): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.set(key, value, ttlSeconds);
    }
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  async cleanup(): Promise<number> {
    let count = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache key builders for common patterns
 */
export const cacheKeys = {
  // User cache keys
  user: (id: string) => `user:${id}`,
  userEmail: (email: string) => `user:email:${email}`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  userClients: (userId: string) => `user:${userId}:clients`,

  // Project cache keys
  project: (id: string) => `project:${id}`,
  projectQuotes: (projectId: string) => `project:${projectId}:quotes`,
  projectMeasurements: (projectId: string) => `project:${projectId}:measurements`,
  projectList: (userId: string) => `projects:${userId}`,

  // Quote cache keys
  quote: (id: string) => `quote:${id}`,
  quoteList: (projectId: string) => `quotes:${projectId}`,

  // Client cache keys
  client: (id: string) => `client:${id}`,
  clientList: (userId: string) => `clients:${userId}`,

  // Measurement cache keys
  measurement: (id: string) => `measurement:${id}`,
  measurementList: (projectId: string) => `measurements:${projectId}`,

  // Session cache keys
  session: (sessionId: string) => `session:${sessionId}`,
  sessionUser: (userId: string) => `session:user:${userId}`,

  // API response cache keys
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
};

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  invalidateUser: async (userId: string) => {
    await cacheManager.delete(cacheKeys.user(userId));
    await cacheManager.delete(cacheKeys.userProjects(userId));
    await cacheManager.delete(cacheKeys.userClients(userId));
  },

  invalidateProject: async (projectId: string) => {
    await cacheManager.delete(cacheKeys.project(projectId));
    await cacheManager.delete(cacheKeys.projectQuotes(projectId));
    await cacheManager.delete(cacheKeys.projectMeasurements(projectId));
  },

  invalidateQuote: async (quoteId: string, projectId: string) => {
    await cacheManager.delete(cacheKeys.quote(quoteId));
    await cacheManager.delete(cacheKeys.quoteList(projectId));
  },

  invalidateClient: async (clientId: string, userId: string) => {
    await cacheManager.delete(cacheKeys.client(clientId));
    await cacheManager.delete(cacheKeys.clientList(userId));
  },

  invalidateSession: async (sessionId: string, userId: string) => {
    await cacheManager.delete(cacheKeys.session(sessionId));
    await cacheManager.delete(cacheKeys.sessionUser(userId));
  },
};

/**
 * Initialize caching system
 */
export async function initializeCaching(): Promise<void> {
  console.log("[Cache Manager] Initializing...");

  // Start cleanup interval (every 5 minutes)
  setInterval(async () => {
    const cleaned = await cacheManager.cleanup();
    if (cleaned > 0) {
      console.log(`[Cache Manager] Cleaned up ${cleaned} expired entries`);
    }
  }, 5 * 60 * 1000);

  console.log("[Cache Manager] Initialization complete");
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStatistics(): {
  size: number;
  stats: CacheStats;
  recommendations: string[];
} {
  const stats = cacheManager.getStats();
  const size = cacheManager.getCacheSize();
  const recommendations: string[] = [];

  if (stats.hitRate < 0.5) {
    recommendations.push("Low cache hit rate. Consider increasing TTL or cache size.");
  }

  if (size > 10000) {
    recommendations.push("Large cache size. Consider implementing cache eviction policy.");
  }

  if (stats.misses > stats.hits * 2) {
    recommendations.push("More misses than hits. Cache strategy may need adjustment.");
  }

  return {
    size,
    stats,
    recommendations,
  };
}

