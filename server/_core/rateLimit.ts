import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

// Create Redis client for distributed rate limiting
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redisClient.on('error', (err) => {
  console.warn('[Rate Limit] Redis connection failed, using in-memory store:', err.message);
});

/**
 * Auth endpoint rate limiter
 * Limits login attempts to prevent brute force attacks
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => req.user !== undefined, // Don't rate limit authenticated users
  keyGenerator: (req) => {
    // Use IP address or X-Forwarded-For header for key
    return req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

/**
 * General API rate limiter
 * Limits API requests to prevent abuse
 * 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

/**
 * Strict API rate limiter for sensitive operations
 * Limits sensitive operations to prevent abuse
 * 10 requests per minute per user
 */
export const strictApiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:strict:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

/**
 * File upload rate limiter
 * Limits file uploads to prevent storage abuse
 * 5 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

/**
 * Export rate limiter
 * Limits data exports to prevent abuse
 * 10 exports per hour per user
 */
export const exportLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:export:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 exports per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

export default {
  authLimiter,
  apiLimiter,
  strictApiLimiter,
  uploadLimiter,
  exportLimiter,
};

