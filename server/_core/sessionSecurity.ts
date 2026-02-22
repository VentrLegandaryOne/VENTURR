/**
 * Session Security Middleware for VENTURR VALDT
 * Implements session timeout, activity tracking, and brute force protection
 */

import type { Request, Response, NextFunction } from "express";

// Session activity tracking
const sessionActivity = new Map<string, { lastActivity: number; userId: number }>();

// Brute force protection
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

// Configuration
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ACTIVITY_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

/**
 * Track session activity and enforce timeout
 */
export function sessionActivityMiddleware(
  req: Request & { user?: { id: number }; sessionId?: string },
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies?.session_id || req.headers["x-session-id"] as string;
  
  if (!sessionId || !req.user?.id) {
    return next();
  }

  const now = Date.now();
  const activity = sessionActivity.get(sessionId);

  if (activity) {
    // Check if session has timed out
    if (now - activity.lastActivity > SESSION_TIMEOUT_MS) {
      // Session expired
      sessionActivity.delete(sessionId);
      return res.status(401).json({
        error: "Session expired",
        code: "SESSION_TIMEOUT",
        message: "Your session has expired due to inactivity. Please log in again.",
      });
    }

    // Verify session belongs to same user (prevent session hijacking)
    if (activity.userId !== req.user.id) {
      sessionActivity.delete(sessionId);
      return res.status(401).json({
        error: "Invalid session",
        code: "SESSION_INVALID",
        message: "Session validation failed. Please log in again.",
      });
    }
  }

  // Update last activity
  sessionActivity.set(sessionId, {
    lastActivity: now,
    userId: req.user.id,
  });

  // Add session info to response headers for client tracking
  res.setHeader("X-Session-Expires", String(now + SESSION_TIMEOUT_MS));

  next();
}

/**
 * Brute force protection for login attempts
 */
export function bruteForceProtectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only apply to login-related endpoints
  if (!req.path.includes("/oauth") && !req.path.includes("/login")) {
    return next();
  }

  const clientIp = getClientIp(req);
  const now = Date.now();
  const attempts = loginAttempts.get(clientIp);

  // Check if IP is currently blocked
  if (attempts && attempts.blockedUntil > now) {
    const remainingTime = Math.ceil((attempts.blockedUntil - now) / 1000);
    return res.status(429).json({
      error: "Too many login attempts",
      code: "RATE_LIMITED",
      message: `Too many failed login attempts. Please try again in ${remainingTime} seconds.`,
      retryAfter: remainingTime,
    });
  }

  next();
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(clientIp: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(clientIp) || { count: 0, blockedUntil: 0 };

  attempts.count++;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.blockedUntil = now + LOCKOUT_DURATION_MS;
    attempts.count = 0; // Reset count after lockout
  }

  loginAttempts.set(clientIp, attempts);
}

/**
 * Record a successful login (clears failed attempts)
 */
export function recordSuccessfulLogin(clientIp: string): void {
  loginAttempts.delete(clientIp);
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Invalidate a session (for logout or security events)
 */
export function invalidateSession(sessionId: string): void {
  sessionActivity.delete(sessionId);
}

/**
 * Invalidate all sessions for a user (password change, security breach)
 */
export function invalidateAllUserSessions(userId: number): void {
  const sessionsToDelete: string[] = [];
  
  sessionActivity.forEach((activity, sessionId) => {
    if (activity.userId === userId) {
      sessionsToDelete.push(sessionId);
    }
  });

  sessionsToDelete.forEach(sessionId => sessionActivity.delete(sessionId));
}

/**
 * Get active session count for a user
 */
export function getActiveSessionCount(userId: number): number {
  let count = 0;
  const now = Date.now();

  sessionActivity.forEach((activity) => {
    if (activity.userId === userId && now - activity.lastActivity <= SESSION_TIMEOUT_MS) {
      count++;
    }
  });

  return count;
}

/**
 * Clean up expired sessions and login attempts periodically
 */
function cleanupExpiredData(): void {
  const now = Date.now();

  // Clean up expired sessions
  const expiredSessions: string[] = [];
  sessionActivity.forEach((activity, sessionId) => {
    if (now - activity.lastActivity > SESSION_TIMEOUT_MS) {
      expiredSessions.push(sessionId);
    }
  });
  expiredSessions.forEach(sessionId => sessionActivity.delete(sessionId));

  // Clean up expired login attempts
  const expiredAttempts: string[] = [];
  loginAttempts.forEach((attempts, ip) => {
    if (attempts.blockedUntil < now && attempts.count === 0) {
      expiredAttempts.push(ip);
    }
  });
  expiredAttempts.forEach(ip => loginAttempts.delete(ip));
}

// Start cleanup interval
setInterval(cleanupExpiredData, ACTIVITY_CLEANUP_INTERVAL_MS);

/**
 * Middleware to verify CSRF token for state-changing requests
 */
export function csrfProtectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip for API endpoints that use Bearer token auth
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"] || req.body?._csrf;
  const sessionCsrf = req.cookies?.csrf_token;

  // For now, just verify the header exists for non-GET requests
  // Full CSRF implementation would compare tokens
  if (!csrfToken && !req.path.includes("/api/trpc")) {
    // Log but don't block for now (gradual rollout)
    console.warn(`[Security] Missing CSRF token for ${req.method} ${req.path}`);
  }

  next();
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}
