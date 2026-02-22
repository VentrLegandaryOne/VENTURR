/**
 * Sentry error tracking configuration for client-side
 */

import * as Sentry from "@sentry/react";

let sentryInitialized = false;

/**
 * Initialize Sentry for client-side error tracking
 */
export function initSentry(): void {
  // Skip if already initialized
  if (sentryInitialized) {
    return;
  }

  // Skip if no DSN provided (development)
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log("[Sentry] Not configured, error tracking disabled");
    return;
  }

  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || "development",
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions
      // In production, you may want to lower this to reduce costs
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      
      // Capture 100% of errors
      sampleRate: 1.0,
      
      // Session replay for debugging
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Integrations
      integrations: [
        // Browser tracing for performance monitoring
        Sentry.browserTracingIntegration({
          // Track React Router navigation
          enableInp: true,
        }),
        
        // Session replay
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Before send hook to filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data) {
              // Remove sensitive fields
              const sanitized = { ...breadcrumb.data };
              delete sanitized.password;
              delete sanitized.token;
              delete sanitized.apiKey;
              delete sanitized.secret;
              breadcrumb.data = sanitized;
            }
            return breadcrumb;
          });
        }
        
        return event;
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
export function setUser(user: { id: number; email?: string; username?: string } | null): void {
  if (!sentryInitialized) {
    return;
  }

  if (user) {
    Sentry.setUser({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Error Boundary component
 */
export const ErrorBoundary = Sentry.ErrorBoundary;
