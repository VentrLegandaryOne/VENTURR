/**
 * Redis connection and caching utilities
 * Using Upstash Redis REST client for serverless compatibility
 */

import { Redis } from "@upstash/redis";

// Redis client instance
let redis: Redis | null = null;
let connectionAttempted = false;

// Upstash credentials from environment
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Get Redis client instance (singleton)
 */
export function getRedisClient(): Redis | null {
  // Check if Upstash credentials are configured
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Only log once to avoid spam
    if (!connectionAttempted) {
      console.log("[Redis] Upstash not configured, caching disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.");
      connectionAttempted = true;
    }
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis({
        url: UPSTASH_URL,
        token: UPSTASH_TOKEN,
      });
      
      console.log("[Redis] Upstash client initialized successfully");
    } catch (error) {
      console.error("[Redis] Failed to initialize Upstash client:", error);
      redis = null;
    }
  }

  return redis;
}

/**
 * Cache key prefixes
 */
export const CacheKeys = {
  USER_ANALYTICS: (userId: number) => `user:${userId}:analytics`,
  USER_STATS: (userId: number) => `user:${userId}:stats`,
  CONTRACTOR_LEADERBOARD: (category?: string) => 
    `contractors:leaderboard${category ? `:${category}` : ""}`,
  QUOTE_VERIFICATION: (quoteId: number) => `quote:${quoteId}:verification`,
  COMPARISON_GROUP: (groupId: number) => `comparison:${groupId}`,
  CONTRACTOR_PERFORMANCE: (contractorId: number) => `contractor:${contractorId}:performance`,
  // License verification cache
  LICENSE_VERIFICATION: (licenseNumber: string, state: string) => 
    `license:${state}:${licenseNumber.toUpperCase()}`,
  // Market rates cache
  MARKET_RATES: (city: string, trade: string) => `market:rates:${city}:${trade}`,
  MARKET_RATE_ITEM: (city: string, trade: string, itemCode: string) => 
    `market:rate:${city}:${trade}:${itemCode}`,
  REGIONAL_ADJUSTMENT: (postcode: string) => `market:regional:${postcode}`,
  MARKET_SUMMARY: () => `market:summary`,
  AVAILABLE_CITIES: () => `market:cities`,
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
  USER_ANALYTICS: 5 * 60, // 5 minutes
  USER_STATS: 10 * 60, // 10 minutes
  CONTRACTOR_LEADERBOARD: 15 * 60, // 15 minutes
  QUOTE_VERIFICATION: 10 * 60, // 10 minutes
  COMPARISON_GROUP: 10 * 60, // 10 minutes
  CONTRACTOR_PERFORMANCE: 10 * 60, // 10 minutes
  // License verification - 24 hours (licenses don't change often)
  LICENSE_VERIFICATION: 24 * 60 * 60, // 24 hours
  // Market rates - 1 hour (updated quarterly, but allow for corrections)
  MARKET_RATES: 60 * 60, // 1 hour
  REGIONAL_ADJUSTMENT: 60 * 60, // 1 hour
  MARKET_SUMMARY: 30 * 60, // 30 minutes
} as const;

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get<T>(key);
    if (value === null || value === undefined) {
      console.log(`[Cache] MISS: ${key}`);
      return null;
    }

    console.log(`[Cache] HIT: ${key}`);
    return value;
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
    console.log(`[Cache] SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error);
  }
}

/**
 * Invalidate (delete) cached value
 */
export async function invalidateCache(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
    console.log(`[Cache] INVALIDATE: ${key}`);
  } catch (error) {
    console.error(`[Cache] Error invalidating key ${key}:`, error);
  }
}

/**
 * Invalidate multiple cache keys matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`[Cache] INVALIDATE PATTERN: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    console.error(`[Cache] Error invalidating pattern ${pattern}:`, error);
  }
}

/**
 * Get or set cached value (cache-aside pattern)
 */
export async function getOrSetCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch fresh data
  const fresh = await fetchFn();
  
  // Store in cache for next time
  await setCached(key, fresh, ttlSeconds);
  
  return fresh;
}

/**
 * Close Redis connection (for graceful shutdown)
 * Note: Upstash REST client doesn't require explicit connection closing
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    redis = null;
    console.log("[Redis] Client reference cleared");
  }
}

/**
 * Test Redis connection
 */
export async function testConnection(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const testKey = "venturr:connection:test";
    await client.set(testKey, "ok", { ex: 10 });
    const result = await client.get(testKey);
    await client.del(testKey);
    return result === "ok";
  } catch (error) {
    console.error("[Redis] Connection test failed:", error);
    return false;
  }
}

/**
 * Health check for Redis - returns detailed status
 * Used by /api/health endpoint
 */
export async function testRedisHealth(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  const client = getRedisClient();
  
  if (!client) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: 'Redis not configured (UPSTASH credentials missing)',
    };
  }

  try {
    const testKey = "venturr:health:check";
    await client.set(testKey, "ok", { ex: 10 });
    const result = await client.get(testKey);
    await client.del(testKey);
    
    if (result !== "ok") {
      return {
        connected: false,
        latencyMs: Date.now() - startTime,
        error: 'Redis read/write verification failed',
      };
    }
    
    return {
      connected: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
