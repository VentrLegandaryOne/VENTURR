/**
 * Structured Error Logging and Tracking
 * Provides consistent error handling across the application
 */

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  /**
   * Log an error with structured information
   */
  log(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      message: typeof error === "string" ? error : error.message,
      category,
      severity,
      stack: typeof error === "object" ? error.stack : undefined,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.push(errorLog);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console with appropriate level
    this.consoleLog(errorLog);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      this.sendToTrackingService(errorLog);
    }

    return errorLog;
  }

  /**
   * Log network errors
   */
  logNetworkError(error: Error, context?: Record<string, any>) {
    return this.log(error, ErrorCategory.NETWORK, ErrorSeverity.HIGH, context);
  }

  /**
   * Log validation errors
   */
  logValidationError(message: string, context?: Record<string, any>) {
    return this.log(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, context);
  }

  /**
   * Log authentication errors
   */
  logAuthError(error: Error, context?: Record<string, any>) {
    return this.log(error, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, context);
  }

  /**
   * Log server errors
   */
  logServerError(error: Error, context?: Record<string, any>) {
    return this.log(error, ErrorCategory.SERVER, ErrorSeverity.CRITICAL, context);
  }

  /**
   * Get all error logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Generate unique ID for error log
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log to console with appropriate level
   */
  private consoleLog(errorLog: ErrorLog) {
    const prefix = `[${errorLog.category.toUpperCase()}] [${errorLog.severity.toUpperCase()}]`;
    
    switch (errorLog.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(prefix, errorLog.message, errorLog.context);
        if (errorLog.stack) console.error(errorLog.stack);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(prefix, errorLog.message, errorLog.context);
        break;
      case ErrorSeverity.LOW:
        console.info(prefix, errorLog.message, errorLog.context);
        break;
    }
  }

  /**
   * Send error to tracking service (placeholder)
   * In production, integrate with Sentry, LogRocket, or similar
   */
  private sendToTrackingService(errorLog: ErrorLog) {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(errorLog);
  }
}

export const errorLogger = new ErrorLogger();

/**
 * Global error handler
 */
export function initGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    errorLogger.log(
      event.reason,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      { type: "unhandledRejection" }
    );
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    errorLogger.log(
      event.error || event.message,
      ErrorCategory.CLIENT,
      ErrorSeverity.HIGH,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // Expose error logger to window for debugging
  (window as any).__errorLogger = errorLogger;
}

/**
 * User-friendly error messages
 */
export function getUserFriendlyMessage(error: Error | string): string {
  const message = typeof error === "string" ? error : error.message;

  // Map technical errors to user-friendly messages
  const errorMap: Record<string, string> = {
    "Network error": "Unable to connect. Please check your internet connection.",
    "Unauthorized": "Please log in to continue.",
    "Forbidden": "You don't have permission to perform this action.",
    "Not found": "The requested resource was not found.",
    "Too many requests": "Too many requests. Please try again later.",
    "Internal server error": "Something went wrong on our end. Please try again.",
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      errorLogger.log(
        `Retry attempt ${i + 1}/${maxRetries} failed`,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        { attempt: i + 1, maxRetries }
      );

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}
