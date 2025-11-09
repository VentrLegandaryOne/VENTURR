/**
 * Performance Caching Layer
 * Redis-based caching for frequently accessed data
 */

import { createClient } from "redis";

interface CacheConfig {
  host?: string;
  port?: number;
  ttl?: number; // Time to live in seconds
}

class CacheManager {
  private client: any = null;
  private connected: boolean = false;
  private ttl: number = 3600; // Default 1 hour

  constructor(config?: CacheConfig) {
    this.ttl = config?.ttl || 3600;

    // Initialize Redis client if available
    if (process.env.REDIS_URL) {
      try {
        this.client = createClient({
          url: process.env.REDIS_URL,
        });

        this.client.on("error", (err: any) => {
          console.warn("[Cache] Redis connection error:", err.message);
          this.connected = false;
        });

        this.client.on("connect", () => {
          console.log("[Cache] Redis connected");
          this.connected = true;
        });

        this.client.connect().catch((err: any) => {
          console.warn("[Cache] Failed to connect to Redis:", err.message);
          this.connected = false;
        });
      } catch (error) {
        console.warn("[Cache] Redis not available, using in-memory cache");
        this.client = null;
      }
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error("[Cache] Get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      const expiryTime = ttl || this.ttl;
      await this.client.setEx(key, expiryTime, JSON.stringify(value));
    } catch (error) {
      console.error("[Cache] Set error:", error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error("[Cache] Delete error:", error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      await this.client.flushDb();
    } catch (error) {
      console.error("[Cache] Clear error:", error);
    }
  }

  /**
   * Get or compute value
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    // Compute value
    const value = await computeFn();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Invalidate cache pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error("[Cache] Pattern invalidation error:", error);
    }
  }
}

// Cache key builders
export const cacheKeys = {
  // Client cache keys
  client: (clientId: string) => `client:${clientId}`,
  clientSearch: (organizationId: string, query: string) =>
    `client:search:${organizationId}:${query}`,
  organizationClients: (organizationId: string) =>
    `clients:org:${organizationId}`,
  clientCommunications: (clientId: string) => `client:comms:${clientId}`,
  clientProjects: (clientId: string) => `client:projects:${clientId}`,
  clientNotes: (clientId: string) => `client:notes:${clientId}`,
  clientSummary: (clientId: string) => `client:summary:${clientId}`,

  // Project cache keys
  project: (projectId: string) => `project:${projectId}`,
  projectTasks: (projectId: string) => `project:tasks:${projectId}`,
  projectTeam: (projectId: string) => `project:team:${projectId}`,
  projectBudget: (projectId: string) => `project:budget:${projectId}`,
  organizationProjects: (organizationId: string) =>
    `projects:org:${organizationId}`,

  // Inventory cache keys
  inventoryItem: (itemId: string) => `inventory:item:${itemId}`,
  inventoryStock: (organizationId: string) =>
    `inventory:stock:${organizationId}`,
  inventoryAlerts: (organizationId: string) =>
    `inventory:alerts:${organizationId}`,

  // Financial cache keys
  invoice: (invoiceId: string) => `invoice:${invoiceId}`,
  organizationInvoices: (organizationId: string) =>
    `invoices:org:${organizationId}`,
  financialSummary: (organizationId: string) =>
    `financial:summary:${organizationId}`,

  // Analytics cache keys
  kpis: (organizationId: string) => `kpis:${organizationId}`,
  revenueTrends: (organizationId: string) =>
    `revenue:trends:${organizationId}`,
  teamPerformance: (organizationId: string) =>
    `team:performance:${organizationId}`,

  // User cache keys
  user: (userId: string) => `user:${userId}`,
  userProjects: (userId: string) => `user:projects:${userId}`,
};

// Global cache instance
let cacheInstance: CacheManager | null = null;

/**
 * Get or create cache instance
 */
export function getCache(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager();
  }
  return cacheInstance;
}

/**
 * Cache middleware for tRPC
 */
export function cacheMiddleware(cacheKey: string, ttl?: number) {
  return async (opts: any) => {
    const cache = getCache();

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute procedure
    const result = await opts.next();

    // Store in cache
    await cache.set(cacheKey, result, ttl);

    return result;
  };
}

/**
 * Invalidate related caches
 */
export async function invalidateClientCache(clientId: string) {
  const cache = getCache();
  await cache.delete(cacheKeys.client(clientId));
  await cache.delete(cacheKeys.clientCommunications(clientId));
  await cache.delete(cacheKeys.clientProjects(clientId));
  await cache.delete(cacheKeys.clientNotes(clientId));
  await cache.delete(cacheKeys.clientSummary(clientId));
}

export async function invalidateProjectCache(projectId: string) {
  const cache = getCache();
  await cache.delete(cacheKeys.project(projectId));
  await cache.delete(cacheKeys.projectTasks(projectId));
  await cache.delete(cacheKeys.projectTeam(projectId));
  await cache.delete(cacheKeys.projectBudget(projectId));
}

export async function invalidateInventoryCache(organizationId: string) {
  const cache = getCache();
  await cache.delete(cacheKeys.inventoryStock(organizationId));
  await cache.delete(cacheKeys.inventoryAlerts(organizationId));
}

export async function invalidateFinancialCache(organizationId: string) {
  const cache = getCache();
  await cache.delete(cacheKeys.organizationInvoices(organizationId));
  await cache.delete(cacheKeys.financialSummary(organizationId));
}

export async function invalidateAnalyticsCache(organizationId: string) {
  const cache = getCache();
  await cache.delete(cacheKeys.kpis(organizationId));
  await cache.delete(cacheKeys.revenueTrends(organizationId));
  await cache.delete(cacheKeys.teamPerformance(organizationId));
}

export default CacheManager;

