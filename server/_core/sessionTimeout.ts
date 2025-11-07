import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAME } from '@shared/const';

/**
 * Session timeout configuration
 * Inactivity timeout: 30 minutes
 * Absolute timeout: 24 hours
 */
export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ABSOLUTE_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  WARNING_THRESHOLD: 5 * 60 * 1000, // Show warning 5 minutes before timeout
};

/**
 * Session metadata stored in session
 */
export interface SessionMetadata {
  createdAt: number;
  lastActivityAt: number;
  warningShown: boolean;
}

/**
 * Get session cookie options with proper security settings
 */
export function getSessionCookieOptions(req: Request) {
  const isSecure = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true, // Prevent XSS attacks
    secure: isSecure, // HTTPS only in production
    sameSite: 'lax' as const, // CSRF protection
    maxAge: SESSION_CONFIG.INACTIVITY_TIMEOUT,
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  };
}

/**
 * Initialize session metadata on login
 */
export function initializeSessionMetadata(): SessionMetadata {
  const now = Date.now();
  return {
    createdAt: now,
    lastActivityAt: now,
    warningShown: false,
  };
}

/**
 * Check if session has timed out due to inactivity
 */
export function isSessionInactive(metadata: SessionMetadata): boolean {
  const now = Date.now();
  const inactiveTime = now - metadata.lastActivityAt;
  return inactiveTime > SESSION_CONFIG.INACTIVITY_TIMEOUT;
}

/**
 * Check if session has exceeded absolute timeout
 */
export function isSessionExpired(metadata: SessionMetadata): boolean {
  const now = Date.now();
  const sessionAge = now - metadata.createdAt;
  return sessionAge > SESSION_CONFIG.ABSOLUTE_TIMEOUT;
}

/**
 * Check if session timeout warning should be shown
 */
export function shouldShowTimeoutWarning(metadata: SessionMetadata): boolean {
  if (metadata.warningShown) return false;
  
  const now = Date.now();
  const inactiveTime = now - metadata.lastActivityAt;
  const timeUntilTimeout = SESSION_CONFIG.INACTIVITY_TIMEOUT - inactiveTime;
  
  return timeUntilTimeout < SESSION_CONFIG.WARNING_THRESHOLD;
}

/**
 * Middleware to check session timeout
 * Destroys session if timed out, updates last activity if active
 */
export function sessionTimeoutMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return next();
  }

  const metadata: SessionMetadata = req.session.metadata || initializeSessionMetadata();

  // Check if session has expired
  if (isSessionExpired(metadata)) {
    req.session.destroy((err) => {
      if (err) console.error('[Session] Destroy error:', err);
      res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true });
      return res.status(401).json({ 
        error: 'Session expired',
        reason: 'absolute_timeout',
      });
    });
    return;
  }

  // Check if session is inactive
  if (isSessionInactive(metadata)) {
    req.session.destroy((err) => {
      if (err) console.error('[Session] Destroy error:', err);
      res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true });
      return res.status(401).json({ 
        error: 'Session expired',
        reason: 'inactivity_timeout',
      });
    });
    return;
  }

  // Check if warning should be shown
  if (shouldShowTimeoutWarning(metadata)) {
    metadata.warningShown = true;
    req.session.metadata = metadata;
    res.setHeader('X-Session-Warning', 'true');
  }

  // Update last activity time
  metadata.lastActivityAt = Date.now();
  req.session.metadata = metadata;

  next();
}

/**
 * Extend session timeout (for "Keep me logged in" functionality)
 */
export function extendSessionTimeout(req: Request): void {
  if (req.session && req.user) {
    const metadata: SessionMetadata = req.session.metadata || initializeSessionMetadata();
    metadata.lastActivityAt = Date.now();
    metadata.warningShown = false;
    req.session.metadata = metadata;
  }
}

/**
 * Get session status for frontend
 */
export function getSessionStatus(req: Request) {
  if (!req.user || !req.session) {
    return {
      authenticated: false,
      timeRemaining: 0,
      willExpireSoon: false,
    };
  }

  const metadata: SessionMetadata = req.session.metadata || initializeSessionMetadata();
  const now = Date.now();
  
  const inactiveTime = now - metadata.lastActivityAt;
  const timeRemaining = Math.max(0, SESSION_CONFIG.INACTIVITY_TIMEOUT - inactiveTime);
  const willExpireSoon = timeRemaining < SESSION_CONFIG.WARNING_THRESHOLD;

  return {
    authenticated: true,
    timeRemaining,
    willExpireSoon,
    createdAt: metadata.createdAt,
    lastActivityAt: metadata.lastActivityAt,
  };
}

/**
 * Logout and destroy session
 */
export function destroySession(req: Request, res: Response, callback?: (err?: Error) => void) {
  if (req.session) {
    req.session.destroy((err) => {
      res.clearCookie(COOKIE_NAME, { 
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      if (callback) {
        callback(err);
      }
    });
  } else {
    res.clearCookie(COOKIE_NAME);
    if (callback) callback();
  }
}

export default {
  SESSION_CONFIG,
  getSessionCookieOptions,
  initializeSessionMetadata,
  isSessionInactive,
  isSessionExpired,
  shouldShowTimeoutWarning,
  sessionTimeoutMiddleware,
  extendSessionTimeout,
  getSessionStatus,
  destroySession,
};

