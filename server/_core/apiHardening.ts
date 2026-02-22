/**
 * API Endpoint Hardening Module for VENTURR VALDT
 * Provides rate limiting, request validation, and API security features
 */

import type { Request, Response, NextFunction } from "express";
import { TRPCError } from "@trpc/server";

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Default rate limit configurations by endpoint type
 */
export const RATE_LIMITS = {
  // General API endpoints
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: "Too many requests, please try again later.",
  },
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: "Too many authentication attempts, please try again later.",
  },
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: "Upload limit reached, please try again later.",
  },
  // AI/LLM endpoints (expensive operations)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: "AI processing limit reached, please try again later.",
  },
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: "Search limit reached, please try again later.",
  },
  // Export endpoints
  export: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: "Export limit reached, please try again later.",
  },
} as const;

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(
  name: string,
  config: Partial<RateLimitConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const opts = { ...RATE_LIMITS.default, ...config };
  
  if (!rateLimitStores.has(name)) {
    rateLimitStores.set(name, new Map());
  }
  
  const store = rateLimitStores.get(name)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.keyGenerator?.(req) || getClientKey(req);
    const now = Date.now();
    
    let entry = store.get(key);
    
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }
    
    entry.count++;
    
    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", opts.maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, opts.maxRequests - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    
    if (entry.count > opts.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      
      return res.status(429).json({
        error: "Too Many Requests",
        message: opts.message,
        retryAfter,
      });
    }
    
    next();
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientKey(req: Request): string {
  // Prefer user ID if authenticated
  const user = (req as Request & { user?: { id: number } }).user;
  if (user?.id) {
    return `user:${user.id}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" 
    ? forwarded.split(",")[0].trim() 
    : req.ip || req.socket.remoteAddress || "unknown";
  
  return `ip:${ip}`;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits(): void {
  const now = Date.now();
  
  rateLimitStores.forEach((store) => {
    const keysToDelete: string[] = [];
    
    store.forEach((entry, key) => {
      if (now > entry.resetAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => store.delete(key));
  });
}

// Clean up every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

// ============================================
// REQUEST SIZE LIMITS
// ============================================

interface RequestSizeLimits {
  maxBodySize: number;
  maxUrlLength: number;
  maxHeaderSize: number;
  maxFieldCount: number;
}

const DEFAULT_SIZE_LIMITS: RequestSizeLimits = {
  maxBodySize: 10 * 1024 * 1024, // 10MB
  maxUrlLength: 2048,
  maxHeaderSize: 8192,
  maxFieldCount: 100,
};

/**
 * Validate request size limits
 */
export function requestSizeLimitMiddleware(
  limits: Partial<RequestSizeLimits> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const opts = { ...DEFAULT_SIZE_LIMITS, ...limits };

  return (req: Request, res: Response, next: NextFunction) => {
    // Check URL length
    if (req.url.length > opts.maxUrlLength) {
      return res.status(414).json({
        error: "URI Too Long",
        message: `URL exceeds maximum length of ${opts.maxUrlLength} characters`,
      });
    }

    // Check header size (approximate)
    const headerSize = Object.entries(req.headers)
      .reduce((sum, [key, value]) => sum + key.length + String(value).length, 0);
    
    if (headerSize > opts.maxHeaderSize) {
      return res.status(431).json({
        error: "Request Header Fields Too Large",
        message: "Request headers exceed maximum size",
      });
    }

    // Check body size (if content-length header is present)
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    if (contentLength > opts.maxBodySize) {
      return res.status(413).json({
        error: "Payload Too Large",
        message: `Request body exceeds maximum size of ${opts.maxBodySize / 1024 / 1024}MB`,
      });
    }

    next();
  };
}

// ============================================
// REQUEST VALIDATION MIDDLEWARE
// ============================================

/**
 * Validate required headers
 */
export function validateRequiredHeaders(
  headers: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingHeaders = headers.filter(h => !req.headers[h.toLowerCase()]);
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: `Missing required headers: ${missingHeaders.join(", ")}`,
      });
    }
    
    next();
  };
}

/**
 * Validate content type
 */
export function validateContentType(
  allowedTypes: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip for GET, HEAD, OPTIONS
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    const contentType = req.headers["content-type"]?.split(";")[0].trim();
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      return res.status(415).json({
        error: "Unsupported Media Type",
        message: `Content-Type must be one of: ${allowedTypes.join(", ")}`,
      });
    }
    
    next();
  };
}

// ============================================
// API VERSIONING
// ============================================

/**
 * API version header middleware
 */
export function apiVersionMiddleware(
  currentVersion: string = "1.0.0"
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set API version headers
    res.setHeader("X-API-Version", currentVersion);
    res.setHeader("X-API-Deprecated", "false");
    
    // Check client's requested version
    const requestedVersion = req.headers["x-api-version"] as string;
    
    if (requestedVersion && requestedVersion !== currentVersion) {
      res.setHeader("X-API-Version-Warning", `Requested version ${requestedVersion} differs from current ${currentVersion}`);
    }
    
    next();
  };
}

// ============================================
// REQUEST ID TRACKING
// ============================================

/**
 * Add unique request ID for tracing
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.headers["x-request-id"] as string || generateRequestId();
  
  // Attach to request for logging
  (req as Request & { requestId: string }).requestId = requestId;
  
  // Include in response headers
  res.setHeader("X-Request-ID", requestId);
  
  next();
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

// ============================================
// SLOW REQUEST DETECTION
// ============================================

interface SlowRequestConfig {
  thresholdMs: number;
  onSlowRequest?: (req: Request, durationMs: number) => void;
}

/**
 * Detect and log slow requests
 */
export function slowRequestMiddleware(
  config: SlowRequestConfig = { thresholdMs: 5000 }
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on("finish", () => {
      const duration = Date.now() - start;
      
      if (duration > config.thresholdMs) {
        console.warn(`[SlowRequest] ${req.method} ${req.path} took ${duration}ms`);
        config.onSlowRequest?.(req, duration);
      }
    });
    
    next();
  };
}

// ============================================
// ENDPOINT PROTECTION HELPERS
// ============================================

/**
 * Protect endpoint with multiple security layers
 */
export function protectEndpoint(options: {
  rateLimit?: keyof typeof RATE_LIMITS;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  maxBodySize?: number;
}): (req: Request, res: Response, next: NextFunction) => void {
  const rateLimitConfig = options.rateLimit ? RATE_LIMITS[options.rateLimit] : RATE_LIMITS.default;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply rate limiting
    const key = getClientKey(req);
    const store = rateLimitStores.get("protected") || new Map();
    rateLimitStores.set("protected", store);
    
    const now = Date.now();
    let entry = store.get(key);
    
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + rateLimitConfig.windowMs };
      store.set(key, entry);
    }
    
    entry.count++;
    
    if (entry.count > rateLimitConfig.maxRequests) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: rateLimitConfig.message,
      });
    }
    
    // Check authentication if required
    const user = (req as Request & { user?: { id: number; role?: string } }).user;
    
    if (options.requireAuth && !user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }
    
    if (options.requireAdmin && user?.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Admin access required",
      });
    }
    
    next();
  };
}

// ============================================
// TPRC RATE LIMIT HELPER
// ============================================

/**
 * Check rate limit for tRPC procedures
 */
export function checkTrpcRateLimit(
  userId: number | null,
  endpoint: string,
  limitType: keyof typeof RATE_LIMITS = "default"
): void {
  const config = RATE_LIMITS[limitType];
  const key = userId ? `user:${userId}:${endpoint}` : `anon:${endpoint}`;
  
  const store = rateLimitStores.get("trpc") || new Map();
  rateLimitStores.set("trpc", store);
  
  const now = Date.now();
  let entry = store.get(key);
  
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    store.set(key, entry);
  }
  
  entry.count++;
  
  if (entry.count > config.maxRequests) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: config.message,
    });
  }
}
