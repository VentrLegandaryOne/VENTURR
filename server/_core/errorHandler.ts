import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

/**
 * Comprehensive error handling for Venturr platform
 * Provides consistent error responses across all API endpoints
 */

export class VenturrError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "VenturrError";
  }
}

export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Business logic errors
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  INVALID_STATE: "INVALID_STATE",
  OPERATION_FAILED: "OPERATION_FAILED",

  // Payment errors
  PAYMENT_FAILED: "PAYMENT_FAILED",
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",
  INVALID_SUBSCRIPTION: "INVALID_SUBSCRIPTION",

  // External service errors
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // Server errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

export function handleZodError(error: ZodError) {
  const fieldErrors = error.flatten().fieldErrors;
  const formattedErrors: Record<string, string> = {};

  Object.entries(fieldErrors).forEach(([field, errors]) => {
    if (errors && errors.length > 0) {
      formattedErrors[field] = errors[0];
    }
  });

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Validation failed",
    cause: formattedErrors,
  });
}

export function handleDatabaseError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("duplicate")) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Record already exists",
      });
    }

    if (message.includes("foreign key")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid reference to related record",
      });
    }

    if (message.includes("connection")) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database operation failed",
  });
}

export function handlePaymentError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("insufficient")) {
      throw new TRPCError({
        code: "PAYMENT_REQUIRED",
        message: "Insufficient funds for payment",
      });
    }

    if (message.includes("expired")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Payment method expired",
      });
    }

    if (message.includes("declined")) {
      throw new TRPCError({
        code: "PAYMENT_REQUIRED",
        message: "Payment was declined",
      });
    }
  }

  throw new TRPCError({
    code: "PAYMENT_REQUIRED",
    message: "Payment processing failed",
  });
}

export function handleExternalServiceError(error: unknown, service: string) {
  if (error instanceof Error) {
    console.error(`[${service}] Error:`, error.message);
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `${service} service temporarily unavailable`,
  });
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message: message || "Operation completed successfully",
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Middleware for comprehensive error logging
 */
export function errorLoggingMiddleware(error: unknown, context: string) {
  const timestamp = new Date().toISOString();

  if (error instanceof TRPCError) {
    console.error(`[${timestamp}] [TRPC] [${context}]`, {
      code: error.code,
      message: error.message,
    });
  } else if (error instanceof VenturrError) {
    console.error(`[${timestamp}] [VENTURR] [${context}]`, {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] [ERROR] [${context}]`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`[${timestamp}] [UNKNOWN] [${context}]`, error);
  }
}

/**
 * Retry logic for transient failures
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors
      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Validation helpers
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateCurrency(amount: string | number): boolean {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount >= 0;
}

/**
 * Permission checking helpers
 */
export function checkPermission(
  userRole: string,
  requiredRole: string | string[]
): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(userRole);
}

export function checkResourceOwnership(
  userId: string,
  resourceOwnerId: string
): boolean {
  return userId === resourceOwnerId;
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Sanitization helpers
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .substring(0, 1000);
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const sanitized = { ...obj };

  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  });

  return sanitized;
}

