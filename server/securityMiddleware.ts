/**
 * Security Middleware for VENTURR VALIDT
 * Comprehensive input validation, rate limiting, and security hardening
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations by endpoint type
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  upload: { windowMs: 60000, maxRequests: 5 }, // 5 uploads per minute
  verification: { windowMs: 60000, maxRequests: 10 }, // 10 verifications per minute
  comparison: { windowMs: 60000, maxRequests: 20 }, // 20 comparisons per minute
  general: { windowMs: 60000, maxRequests: 100 }, // 100 general requests per minute
  auth: { windowMs: 300000, maxRequests: 10 }, // 10 auth attempts per 5 minutes
};

/**
 * Check rate limit for a user/endpoint combination
 */
export function checkRateLimit(
  userId: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.general
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Rate limit middleware for tRPC
 */
export function rateLimitMiddleware(endpointType: keyof typeof RATE_LIMITS = "general") {
  return ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
    const userId = ctx.user?.id || ctx.ip || "anonymous";
    const config = RATE_LIMITS[endpointType];
    const result = checkRateLimit(userId, endpointType, config);

    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please try again in ${Math.ceil(result.resetIn / 1000)} seconds.`,
      });
    }

    return next();
  };
}

// Input sanitization patterns
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /javascript:/gi, // JavaScript URLs
  /on\w+\s*=/gi, // Event handlers
  /data:/gi, // Data URLs (potential XSS)
  /vbscript:/gi, // VBScript URLs
  /expression\s*\(/gi, // CSS expressions
];

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(--)|(;)|(\/\*)|(\*\/)/g, // SQL comments
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi, // OR 1=1 patterns
];

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return input;

  let sanitized = input;

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized;
}

/**
 * Check for SQL injection attempts
 */
export function detectSQLInjection(input: string): boolean {
  if (!input || typeof input !== "string") return false;

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

/**
 * Validate and sanitize file upload
 */
export const fileUploadSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name too long")
    .refine(
      (name) => /^[\w\-. ]+$/.test(name),
      "File name contains invalid characters"
    )
    .transform((name) => {
      // Remove path traversal attempts
      return name.replace(/\.\./g, "").replace(/[\/\\]/g, "");
    }),
  fileSize: z
    .number()
    .min(1, "File cannot be empty")
    .max(50 * 1024 * 1024, "File size exceeds 50MB limit"),
  mimeType: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  fileUrl: z.string().url("Invalid file URL").optional(),
});

/**
 * Validate quote input
 */
export const quoteInputSchema = z.object({
  contractorName: z
    .string()
    .min(1, "Contractor name is required")
    .max(200, "Contractor name too long")
    .transform(sanitizeString),
  projectType: z
    .string()
    .min(1, "Project type is required")
    .max(100, "Project type too long")
    .transform(sanitizeString),
  description: z
    .string()
    .max(5000, "Description too long")
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  totalAmount: z
    .number()
    .min(0, "Amount cannot be negative")
    .max(100000000, "Amount exceeds maximum"),
});

/**
 * Validate comparison input
 */
export const comparisonInputSchema = z.object({
  name: z
    .string()
    .min(1, "Comparison name is required")
    .max(200, "Name too long")
    .transform(sanitizeString),
  quoteIds: z
    .array(z.number().positive())
    .min(2, "At least 2 quotes required")
    .max(5, "Maximum 5 quotes allowed"),
});

/**
 * Validate search/filter input
 */
export const searchInputSchema = z.object({
  query: z
    .string()
    .max(200, "Search query too long")
    .transform(sanitizeString)
    .refine(
      (q) => !detectSQLInjection(q),
      "Invalid search query"
    ),
  page: z.number().min(1).max(1000).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "score"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Security headers middleware
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.perplexity.ai",
  };
}

/**
 * Validate JWT token format
 */
export function validateTokenFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;

  // JWT format: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  // Check each part is base64url encoded
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every((part) => base64urlRegex.test(part));
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  userId: string | null,
  details: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId: userId || "anonymous",
    ...details,
  };

  // In production, send to security monitoring service
  console.log("[SECURITY]", JSON.stringify(logEntry));
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ["password", "token", "apiKey", "secret", "authorization"];
  const masked = { ...data };

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      masked[key] = "***REDACTED***";
    }
  }

  return masked;
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  const allowedOrigins = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/.*\.manus\.space$/,
    /^https:\/\/.*\.manus-asia\.computer$/,
  ];

  return allowedOrigins.some((pattern) => pattern.test(origin));
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  if (token.length !== storedToken.length) return false;

  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
}

export default {
  checkRateLimit,
  rateLimitMiddleware,
  sanitizeString,
  detectSQLInjection,
  fileUploadSchema,
  quoteInputSchema,
  comparisonInputSchema,
  searchInputSchema,
  getSecurityHeaders,
  validateTokenFormat,
  logSecurityEvent,
  maskSensitiveData,
  isValidOrigin,
  generateCSRFToken,
  validateCSRFToken,
};
