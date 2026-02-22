/**
 * Global error handling utilities
 */

import { TRPCError } from "@trpc/server";
import { logSecurityEvent } from "./securityLogger";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Convert various error types to TRPC errors
 */
export function toTRPCError(error: unknown): TRPCError {
  // Already a TRPC error
  if (error instanceof TRPCError) {
    return error;
  }

  // App error
  if (error instanceof AppError) {
    return new TRPCError({
      code: mapStatusCodeToTRPCCode(error.statusCode),
      message: error.message,
      cause: error,
    });
  }

  // Standard error
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("not found")) {
      return new TRPCError({
        code: "NOT_FOUND",
        message: error.message,
      });
    }

    if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
      return new TRPCError({
        code: "FORBIDDEN",
        message: error.message,
      });
    }

    // Generic internal error
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      cause: error,
    });
  }

  // Unknown error
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unknown error occurred",
  });
}

/**
 * Map HTTP status codes to TRPC error codes
 */
function mapStatusCodeToTRPCCode(statusCode: number): TRPCError["code"] {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

/**
 * Log error with appropriate severity
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  
  if (error instanceof AppError) {
    console.error(`[${timestamp}] [${error.code}]`, error.message, {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details,
      context,
      stack: error.stack,
    });
  } else if (error instanceof TRPCError) {
    console.error(`[${timestamp}] [TRPC:${error.code}]`, error.message, {
      context,
      cause: error.cause,
    });
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] [ERROR]`, error.message, {
      context,
      stack: error.stack,
    });
  } else {
    console.error(`[${timestamp}] [UNKNOWN_ERROR]`, error, { context });
  }

  // Log security events for certain error types
  if (error instanceof TRPCError && error.code === "FORBIDDEN") {
    logSecurityEvent({
      type: "unauthorized_access",
      details: { error: error.message, context },
      severity: "high",
    });
  }
}

/**
 * Retry logic for transient failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on operational errors
      if (error instanceof AppError && error.isOperational) {
        throw error;
      }

      // Don't retry on TRPC client errors
      if (error instanceof TRPCError && 
          ["BAD_REQUEST", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND"].includes(error.code)) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        
        if (onRetry) {
          onRetry(lastError, attempt);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Graceful error recovery with fallback
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T | (() => T | Promise<T>),
  options: {
    logError?: boolean;
    context?: Record<string, any>;
  } = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (options.logError !== false) {
      logError(error, options.context);
    }

    return typeof fallback === "function" ? await (fallback as () => T | Promise<T>)() : fallback;
  }
}

/**
 * Validate and sanitize error messages for user display
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof TRPCError) {
    switch (error.code) {
      case "UNAUTHORIZED":
        return "Please log in to continue";
      case "FORBIDDEN":
        return "You don't have permission to perform this action";
      case "NOT_FOUND":
        return "The requested resource was not found";
      case "BAD_REQUEST":
        return error.message || "Invalid request";
      case "TOO_MANY_REQUESTS":
        return "Too many requests. Please try again later";
      case "INTERNAL_SERVER_ERROR":
        return "An unexpected error occurred. Please try again";
      default:
        return "Something went wrong. Please try again";
    }
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose internal error details to users
    return "An error occurred. Please try again";
  }

  return "Something went wrong. Please try again";
}
