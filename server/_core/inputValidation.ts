/**
 * Input Validation and Sanitization Module for VENTURR VALDT
 * Provides comprehensive input validation, sanitization, and security checks
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ============================================
// XSS SANITIZATION
// ============================================

/**
 * HTML entity encoding map for XSS prevention
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Sanitize string to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeHtml(item) : item
      );
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// ============================================
// SQL INJECTION PREVENTION
// ============================================

/**
 * Dangerous SQL patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
  /(--)|(\/\*)|(\*\/)/,
  /(;|\||\||&&)/,
  /(\bOR\b|\bAND\b).*?[=<>]/i,
  /['"].*?['"].*?[=<>]/,
];

/**
 * Check for potential SQL injection attempts
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== "string") return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Validate input is safe from SQL injection
 */
export function validateNoSqlInjection(input: string, fieldName: string = "input"): void {
  if (detectSqlInjection(input)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid characters detected in ${fieldName}`,
    });
  }
}

// ============================================
// PATH TRAVERSAL PREVENTION
// ============================================

/**
 * Sanitize file paths to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  return path
    .replace(/\.\./g, "")
    .replace(/\/\//g, "/")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/[<>:"|?*]/g, "");
}

/**
 * Validate file path is safe
 */
export function validateFilePath(path: string): void {
  if (path.includes("..") || path.includes("//") || /[<>:"|?*\\]/.test(path)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid file path",
    });
  }
}

// ============================================
// COMMON ZOD SCHEMAS
// ============================================

/**
 * Safe string schema with XSS prevention
 */
export const safeString = (maxLength: number = 1000) =>
  z.string()
    .max(maxLength, `Input must be ${maxLength} characters or less`)
    .transform(sanitizeHtml);

/**
 * Safe email schema
 */
export const safeEmail = z.string()
  .email("Invalid email address")
  .max(254, "Email must be 254 characters or less")
  .toLowerCase()
  .transform(sanitizeHtml);

/**
 * Safe URL schema
 */
export const safeUrl = z.string()
  .url("Invalid URL")
  .max(2048, "URL must be 2048 characters or less")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    "URL must use HTTP or HTTPS protocol"
  );

/**
 * Safe phone number schema (Australian format)
 */
export const safePhone = z.string()
  .regex(/^(\+61|0)[2-9]\d{8}$/, "Invalid Australian phone number")
  .transform((val) => val.replace(/\s/g, ""));

/**
 * Safe ABN schema (Australian Business Number)
 */
export const safeABN = z.string()
  .regex(/^\d{11}$/, "ABN must be exactly 11 digits")
  .refine(validateABN, "Invalid ABN checksum");

/**
 * Validate ABN checksum
 */
function validateABN(abn: string): boolean {
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = abn.split("").map(Number);
  digits[0] -= 1; // Subtract 1 from first digit
  
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  return sum % 89 === 0;
}

/**
 * Safe integer ID schema
 */
export const safeId = z.number()
  .int("ID must be an integer")
  .positive("ID must be positive")
  .max(2147483647, "ID exceeds maximum value");

/**
 * Safe pagination schema
 */
export const safePagination = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

/**
 * Safe search query schema
 */
export const safeSearchQuery = z.string()
  .max(200, "Search query too long")
  .transform((val) => sanitizeHtml(val.trim()))
  .refine((val) => !detectSqlInjection(val), "Invalid search query");

/**
 * Safe file name schema
 */
export const safeFileName = z.string()
  .max(255, "File name too long")
  .regex(/^[a-zA-Z0-9._-]+$/, "File name contains invalid characters")
  .refine(
    (name) => !name.includes("..") && !name.startsWith("."),
    "Invalid file name"
  );

/**
 * Safe JSON schema (validates JSON string)
 */
export const safeJson = z.string()
  .max(1000000, "JSON too large") // 1MB limit
  .transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      throw new Error("Invalid JSON");
    }
  });

// ============================================
// CONTENT VALIDATION
// ============================================

/**
 * Validate content length with proper error messages
 */
export function validateContentLength(
  content: string,
  maxLength: number,
  fieldName: string = "content"
): void {
  if (content.length > maxLength) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} exceeds maximum length of ${maxLength} characters`,
    });
  }
}

/**
 * Validate array length
 */
export function validateArrayLength<T>(
  array: T[],
  maxLength: number,
  fieldName: string = "items"
): void {
  if (array.length > maxLength) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Too many ${fieldName}. Maximum allowed: ${maxLength}`,
    });
  }
}

// ============================================
// REQUEST VALIDATION MIDDLEWARE
// ============================================

/**
 * Validate request body size
 */
export function validateRequestSize(
  body: unknown,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): void {
  const bodySize = JSON.stringify(body).length;
  if (bodySize > maxSizeBytes) {
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: `Request body exceeds maximum size of ${maxSizeBytes / 1024 / 1024}MB`,
    });
  }
}

/**
 * Deep freeze object to prevent modification
 */
export function deepFreeze<T extends Record<string, unknown>>(obj: T): Readonly<T> {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value as Record<string, unknown>);
    }
  });
  return Object.freeze(obj);
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 60000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Validate rate limit is not exceeded
 */
export function validateRateLimit(
  currentCount: number,
  maxCount: number,
  windowDescription: string = "this time period"
): void {
  if (currentCount >= maxCount) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Maximum ${maxCount} requests allowed per ${windowDescription}.`,
    });
  }
}
