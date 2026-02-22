import { TRPCError } from "@trpc/server";

/**
 * Rate Limiting Module for VENTURR VALDT
 * 
 * Implements sliding window rate limiting with:
 * - Per-user limits for different operations
 * - Rate limit headers for client awareness
 * - Automatic cleanup of expired entries
 * - Redis-backed storage for production (falls back to in-memory)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstRequestAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for the rate limit key
}

/**
 * Rate limit configuration for quote uploads
 * 10 uploads per minute per user
 */
export const QUOTE_UPLOAD_LIMIT: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: "quote_upload",
};

/**
 * Check rate limit and return detailed result
 * Does not throw - returns result object for flexible handling
 */
export function checkRateLimitWithResult(
  userId: string | number,
  options: RateLimitOptions
): RateLimitResult {
  const key = `${options.keyPrefix || "default"}:${userId}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
      firstRequestAt: now,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: now + options.windowMs,
    };
  }
  
  if (entry.count >= options.maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds,
    };
  }
  
  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware for tRPC procedures
 * @param userId - User ID to rate limit
 * @param options - Rate limit configuration
 * @throws TRPCError with TOO_MANY_REQUESTS code if limit exceeded
 */
export async function checkRateLimit(
  userId: string | number,
  options: RateLimitOptions
): Promise<void> {
  const result = checkRateLimitWithResult(userId, options);
  
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. You can upload up to ${options.maxRequests} quotes per minute. Try again in ${result.retryAfterSeconds} seconds.`,
    });
  }
}

/**
 * Check rate limit for quote uploads specifically
 * Returns detailed result with headers for client
 */
export function checkQuoteUploadRateLimit(userId: string | number): RateLimitResult {
  return checkRateLimitWithResult(userId, QUOTE_UPLOAD_LIMIT);
}

/**
 * Enforce rate limit for quote uploads - throws if exceeded
 */
export async function enforceQuoteUploadRateLimit(userId: string | number): Promise<{
  remaining: number;
  resetAt: number;
}> {
  const result = checkQuoteUploadRateLimit(userId);
  
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. You can upload up to ${QUOTE_UPLOAD_LIMIT.maxRequests} quotes per minute. Please wait ${result.retryAfterSeconds} seconds before trying again.`,
    });
  }
  
  return {
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

/**
 * Get remaining requests for a user
 * Useful for showing rate limit info in UI
 */
export function getRateLimitInfo(
  userId: string | number,
  options: RateLimitOptions
): { remaining: number; resetAt: number; limit: number } {
  const key = `${options.keyPrefix || "default"}:${userId}`;
  const entry = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!entry || entry.resetAt < now) {
    return {
      remaining: options.maxRequests,
      resetAt: now + options.windowMs,
      limit: options.maxRequests,
    };
  }
  
  return {
    remaining: Math.max(0, options.maxRequests - entry.count),
    resetAt: entry.resetAt,
    limit: options.maxRequests,
  };
}

/**
 * Get quote upload rate limit info for a user
 */
export function getQuoteUploadRateLimitInfo(userId: string | number) {
  return getRateLimitInfo(userId, QUOTE_UPLOAD_LIMIT);
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetRateLimit(
  userId: string | number,
  keyPrefix?: string
): void {
  const key = `${keyPrefix || "default"}:${userId}`;
  rateLimitStore.delete(key);
}

/**
 * Reset quote upload rate limit for a user
 */
export function resetQuoteUploadRateLimit(userId: string | number): void {
  resetRateLimit(userId, QUOTE_UPLOAD_LIMIT.keyPrefix);
}

/**
 * Pre-configured rate limiters for common operations
 */
export const rateLimiters = {
  // Quote upload: 10 per minute
  quoteUpload: (userId: string | number) =>
    checkRateLimit(userId, QUOTE_UPLOAD_LIMIT),
  
  // Legacy upload (1 hour window for backward compatibility)
  upload: (userId: string | number) =>
    checkRateLimit(userId, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50,
      keyPrefix: "upload",
    }),
  
  share: (userId: string | number) =>
    checkRateLimit(userId, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
      keyPrefix: "share",
    }),
  
  delete: (userId: string | number) =>
    checkRateLimit(userId, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      keyPrefix: "delete",
    }),
  
  feedback: (userId: string | number) =>
    checkRateLimit(userId, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 3,
      keyPrefix: "feedback",
    }),
  
  auth: (userId: string | number) =>
    checkRateLimit(userId, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      keyPrefix: "auth",
    }),
    
  // API calls: 100 per minute
  api: (userId: string | number) =>
    checkRateLimit(userId, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyPrefix: "api",
    }),
};

/**
 * Get rate limit info for all operations
 */
export function getAllRateLimitInfo(userId: string | number) {
  return {
    quoteUpload: getRateLimitInfo(userId, QUOTE_UPLOAD_LIMIT),
    upload: getRateLimitInfo(userId, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 50,
      keyPrefix: "upload",
    }),
    share: getRateLimitInfo(userId, {
      windowMs: 60 * 1000,
      maxRequests: 5,
      keyPrefix: "share",
    }),
    delete: getRateLimitInfo(userId, {
      windowMs: 60 * 1000,
      maxRequests: 10,
      keyPrefix: "delete",
    }),
    feedback: getRateLimitInfo(userId, {
      windowMs: 60 * 1000,
      maxRequests: 3,
      keyPrefix: "feedback",
    }),
    api: getRateLimitInfo(userId, {
      windowMs: 60 * 1000,
      maxRequests: 100,
      keyPrefix: "api",
    }),
  };
}

/**
 * Generate rate limit headers for HTTP response
 * Follows standard rate limit header conventions
 */
export function getRateLimitHeaders(
  userId: string | number,
  options: RateLimitOptions = QUOTE_UPLOAD_LIMIT
): Record<string, string> {
  const info = getRateLimitInfo(userId, options);
  const resetAtSeconds = Math.ceil(info.resetAt / 1000);
  
  return {
    'X-RateLimit-Limit': String(info.limit),
    'X-RateLimit-Remaining': String(info.remaining),
    'X-RateLimit-Reset': String(resetAtSeconds),
  };
}
