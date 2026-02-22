/**
 * Sentry error tracking configuration for server-side
 */

import * as Sentry from "@sentry/node";

let sentryInitialized = false;

/**
 * Initialize Sentry for error tracking
 */
export function initSentry(): void {
  // Skip if already initialized
  if (sentryInitialized) {
    return;
  }

  // Skip in development if no DSN provided
  if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DSN) {
    console.log("[Sentry] Not configured, error tracking disabled");
    return;
  }

  // Require SENTRY_DSN in production
  if (process.env.NODE_ENV === "production" && !process.env.SENTRY_DSN) {
    console.warn("[Sentry] SENTRY_DSN not set in production! Error tracking disabled.");
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      // In production, you may want to lower this to reduce costs
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      
      // Capture 100% of errors
      sampleRate: 1.0,
      
      // Before send hook to filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        
        // Remove sensitive query params
        if (event.request?.query_string) {
          const params = new URLSearchParams(event.request.query_string);
          params.delete("token");
          params.delete("apiKey");
          event.request.query_string = params.toString();
        }
        
        return event;
      },
      
      // Before breadcrumb hook to filter sensitive breadcrumbs
      beforeBreadcrumb(breadcrumb, hint) {
        // Don't log SQL queries with sensitive data
        if (breadcrumb.category === "query" && breadcrumb.message) {
          // Redact potential sensitive data in SQL queries
          breadcrumb.message = breadcrumb.message.replace(
            /(password|token|secret|key)\s*=\s*'[^']*'/gi,
            "$1='[REDACTED]'"
          );
        }
        
        return breadcrumb;
      },
    });

    sentryInitialized = true;
    console.log("[Sentry] Initialized successfully");
  } catch (error) {
    console.error("[Sentry] Failed to initialize:", error);
  }
}

/**
 * Capture exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message with Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Set user context
 */
export function setUser(user: { id: number; email?: string; username?: string }): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.setContext(name, context);
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): any {
  if (!sentryInitialized) {
    return null;
  }

  // In Sentry v10+, use startSpan instead
  return Sentry.startSpan({ name, op }, (span) => span);
}

/**
 * Flush pending events (useful before shutdown)
 */
export async function flushSentry(timeout: number = 2000): Promise<boolean> {
  if (!sentryInitialized) {
    return true;
  }

  return await Sentry.flush(timeout);
}
