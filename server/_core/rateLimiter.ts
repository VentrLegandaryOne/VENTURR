import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (upgrade to Redis for production)
const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Function to generate rate limit key
  handler?: (req: Request, res: Response) => void; // Custom handler for rate limit exceeded
}

/**
 * Rate limiting middleware
 * Limits requests based on IP address or custom key
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100,
    keyGenerator = (req) => req.ip || 'unknown',
    handler,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or get existing rate limit data
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    const data = store[key];

    // Reset if window has passed
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Increment request count
    data.count++;

    // Check if limit exceeded
    if (data.count > maxRequests) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);

      res.set('Retry-After', retryAfter.toString());
      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', data.resetTime.toString());

      if (handler) {
        return handler(req, res);
      }

      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      });
    }

    // Set rate limit headers
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', (maxRequests - data.count).toString());
    res.set('X-RateLimit-Reset', data.resetTime.toString());

    next();
  };
}

/**
 * Cleanup old entries from rate limit store (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

/**
 * Common rate limit presets
 */
export const rateLimitPresets = {
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },

  // Standard limit for API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },

  // Loose limit for public endpoints
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
  },

  // Very strict for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
  },
};

// Cleanup old entries every 10 minutes
setInterval(cleanupRateLimitStore, 10 * 60 * 1000);

