import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * CSRF protection middleware
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Generate and set CSRF token in cookie if not present
  let csrfToken = req.cookies[CSRF_COOKIE_NAME];
  if (!csrfToken) {
    csrfToken = generateCSRFToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false, // Allow JavaScript to read for AJAX
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  // Store token in response locals for template rendering
  res.locals.csrfToken = csrfToken;

  // Validate CSRF token on state-changing requests
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;
  const tokenFromBody = (req.body?.csrfToken || req.body?._csrf) as string;
  const tokenFromRequest = tokenFromHeader || tokenFromBody;

  if (!tokenFromRequest) {
    return res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  if (tokenFromRequest !== csrfToken) {
    return res.status(403).json({
      error: 'CSRF token invalid',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  next();
}

/**
 * Middleware to attach CSRF token to request
 */
export function attachCSRFToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const csrfToken = generateCSRFToken();
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.locals.csrfToken = csrfToken;
  next();
}

