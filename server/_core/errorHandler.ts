import { TRPCError } from "@trpc/server";

/**
 * Standardized error handling for tRPC procedures
 * Provides consistent error responses and logging
 */

export class AppError extends Error {
  constructor(
    public code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR',
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): never {
  // Log error for debugging
  console.error('[Error Handler]', error);

  // Handle known AppError
  if (error instanceof AppError) {
    throw new TRPCError({
      code: error.code,
      message: error.message,
      cause: error.details,
    });
  }

  // Handle TRPCError (already formatted)
  if (error instanceof TRPCError) {
    throw error;
  }

  // Handle database errors
  if (error instanceof Error) {
    if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A record with this information already exists',
      });
    }

    if (error.message.includes('foreign key constraint')) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot perform this action due to related records',
      });
    }

    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      });
    }
  }

  // Generic error fallback
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    cause: error,
  });
}

/**
 * Validates required fields
 */
export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined || value === '') {
    throw new AppError('BAD_REQUEST', `${fieldName} is required`);
  }
  return value;
}

/**
 * Validates string length
 */
export function validateLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): void {
  if (min !== undefined && value.length < min) {
    throw new AppError('BAD_REQUEST', `${fieldName} must be at least ${min} characters`);
  }
  if (max !== undefined && value.length > max) {
    throw new AppError('BAD_REQUEST', `${fieldName} must be at most ${max} characters`);
  }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('BAD_REQUEST', 'Invalid email format');
  }
}

/**
 * Validates number range
 */
export function validateRange(
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): void {
  if (min !== undefined && value < min) {
    throw new AppError('BAD_REQUEST', `${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && value > max) {
    throw new AppError('BAD_REQUEST', `${fieldName} must be at most ${max}`);
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON
 */
export function safeJsonStringify(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch {
    return '{}';
  }
}

/**
 * Retry logic for database operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error instanceof AppError && error.code === 'BAD_REQUEST') {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

/**
 * Async error wrapper for procedures
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error);
    }
  }) as T;
}

