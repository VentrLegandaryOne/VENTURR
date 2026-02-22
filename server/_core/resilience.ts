/**
 * Resilience and Error Handling Module for VENTURR VALDT
 * Provides retry logic, circuit breaker, graceful degradation, and timeout handling
 */

import { TRPCError } from "@trpc/server";

// ============================================
// RETRY LOGIC
// ============================================

interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableErrors: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "NETWORK_ERROR",
    "SERVICE_UNAVAILABLE",
  ],
};

/**
 * Execute a function with automatic retry on transient failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error, opts.retryableErrors);
      
      if (!isRetryable || attempt === opts.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateBackoffDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
      
      // Call retry callback if provided
      opts.onRetry?.(attempt, lastError);
      
      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, retryableCodes?: string[]): boolean {
  if (!error || typeof error !== "object") return false;
  
  const err = error as { code?: string; message?: string; status?: number };
  
  // Check error code
  if (err.code && retryableCodes?.includes(err.code)) {
    return true;
  }
  
  // Check for network errors in message
  if (err.message) {
    const networkErrors = ["network", "timeout", "connection", "ECONNRESET"];
    if (networkErrors.some(e => err.message?.toLowerCase().includes(e.toLowerCase()))) {
      return true;
    }
  }
  
  // Check HTTP status codes (5xx are retryable)
  if (err.status && err.status >= 500 && err.status < 600) {
    return true;
  }
  
  return false;
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  // Add jitter (±25%)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// CIRCUIT BREAKER
// ============================================

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: "closed" | "open" | "half-open";
}

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenRequests: number;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

const DEFAULT_CIRCUIT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
  halfOpenRequests: 1,
};

/**
 * Execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  options: Partial<CircuitBreakerOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_CIRCUIT_OPTIONS, ...options };
  let state = circuitBreakers.get(name);

  if (!state) {
    state = { failures: 0, lastFailure: 0, state: "closed" };
    circuitBreakers.set(name, state);
  }

  // Check if circuit is open
  if (state.state === "open") {
    const timeSinceLastFailure = Date.now() - state.lastFailure;
    
    if (timeSinceLastFailure < opts.resetTimeoutMs) {
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: `Service temporarily unavailable. Please try again in ${Math.ceil((opts.resetTimeoutMs - timeSinceLastFailure) / 1000)} seconds.`,
      });
    }
    
    // Move to half-open state
    state.state = "half-open";
  }

  try {
    const result = await fn();
    
    // Success - reset circuit
    state.failures = 0;
    state.state = "closed";
    
    return result;
  } catch (error) {
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= opts.failureThreshold) {
      state.state = "open";
    }
    
    throw error;
  }
}

/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus(name: string): CircuitBreakerState | undefined {
  return circuitBreakers.get(name);
}

/**
 * Reset circuit breaker
 */
export function resetCircuitBreaker(name: string): void {
  circuitBreakers.delete(name);
}

// ============================================
// TIMEOUT HANDLING
// ============================================

/**
 * Execute a function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TRPCError({
        code: "TIMEOUT",
        message: errorMessage,
      }));
    }, timeoutMs);
  });

  return Promise.race([fn(), timeoutPromise]);
}

// ============================================
// GRACEFUL DEGRADATION
// ============================================

interface FallbackOptions<T> {
  fallbackValue: T;
  logError?: boolean;
  errorMessage?: string;
}

/**
 * Execute a function with fallback on failure
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  options: FallbackOptions<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (options.logError !== false) {
      console.error(`[Fallback] ${options.errorMessage || "Operation failed"}:`, error);
    }
    return options.fallbackValue;
  }
}

/**
 * Execute multiple functions and return first successful result
 */
export async function withFallbackChain<T>(
  fns: Array<() => Promise<T>>,
  errorMessage: string = "All fallback options failed"
): Promise<T> {
  let lastError: Error | null = null;

  for (const fn of fns) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn("[FallbackChain] Attempt failed:", error);
    }
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: errorMessage,
    cause: lastError,
  });
}

// ============================================
// BULKHEAD PATTERN
// ============================================

interface BulkheadState {
  concurrent: number;
  queue: Array<{
    resolve: (value: void) => void;
    reject: (error: Error) => void;
  }>;
}

const bulkheads = new Map<string, BulkheadState>();

interface BulkheadOptions {
  maxConcurrent: number;
  maxQueue: number;
  queueTimeoutMs: number;
}

const DEFAULT_BULKHEAD_OPTIONS: BulkheadOptions = {
  maxConcurrent: 10,
  maxQueue: 100,
  queueTimeoutMs: 30000,
};

/**
 * Execute a function with bulkhead isolation
 */
export async function withBulkhead<T>(
  name: string,
  fn: () => Promise<T>,
  options: Partial<BulkheadOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_BULKHEAD_OPTIONS, ...options };
  let state = bulkheads.get(name);

  if (!state) {
    state = { concurrent: 0, queue: [] };
    bulkheads.set(name, state);
  }

  // Check if we can execute immediately
  if (state.concurrent < opts.maxConcurrent) {
    state.concurrent++;
    try {
      return await fn();
    } finally {
      state.concurrent--;
      processQueue(name);
    }
  }

  // Check if queue is full
  if (state.queue.length >= opts.maxQueue) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Service is at capacity. Please try again later.",
    });
  }

  // Add to queue
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      const index = state!.queue.findIndex(item => item.resolve === queueResolve);
      if (index !== -1) {
        state!.queue.splice(index, 1);
      }
      reject(new TRPCError({
        code: "TIMEOUT",
        message: "Request queued for too long. Please try again.",
      }));
    }, opts.queueTimeoutMs);

    const queueResolve = () => {
      clearTimeout(timeout);
      state!.concurrent++;
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          state!.concurrent--;
          processQueue(name);
        });
    };

    state!.queue.push({ resolve: queueResolve, reject });
  });
}

/**
 * Process queued requests
 */
function processQueue(name: string): void {
  const state = bulkheads.get(name);
  if (!state || state.queue.length === 0) return;

  const next = state.queue.shift();
  if (next) {
    next.resolve();
  }
}

// ============================================
// ERROR CLASSIFICATION
// ============================================

/**
 * Classify error for appropriate handling
 */
export function classifyError(error: unknown): {
  isRetryable: boolean;
  isUserError: boolean;
  severity: "low" | "medium" | "high" | "critical";
  shouldNotify: boolean;
} {
  if (!error || typeof error !== "object") {
    return { isRetryable: false, isUserError: false, severity: "medium", shouldNotify: true };
  }

  const err = error as { code?: string; message?: string; status?: number };

  // User errors (4xx)
  if (err.status && err.status >= 400 && err.status < 500) {
    return { isRetryable: false, isUserError: true, severity: "low", shouldNotify: false };
  }

  // Server errors (5xx)
  if (err.status && err.status >= 500) {
    return { isRetryable: true, isUserError: false, severity: "high", shouldNotify: true };
  }

  // Network errors
  if (err.code && ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].includes(err.code)) {
    return { isRetryable: true, isUserError: false, severity: "medium", shouldNotify: false };
  }

  // Default
  return { isRetryable: false, isUserError: false, severity: "medium", shouldNotify: true };
}

// ============================================
// HEALTH CHECK
// ============================================

interface HealthStatus {
  healthy: boolean;
  services: Record<string, { healthy: boolean; latencyMs?: number; error?: string }>;
  timestamp: number;
}

/**
 * Perform health check on multiple services
 */
export async function checkHealth(
  checks: Record<string, () => Promise<void>>
): Promise<HealthStatus> {
  const services: HealthStatus["services"] = {};
  let allHealthy = true;

  for (const [name, check] of Object.entries(checks)) {
    const start = Date.now();
    try {
      await withTimeout(check, 5000, `Health check for ${name} timed out`);
      services[name] = { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      allHealthy = false;
      services[name] = {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return {
    healthy: allHealthy,
    services,
    timestamp: Date.now(),
  };
}
