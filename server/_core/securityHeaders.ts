/**
 * Security Headers Middleware for VENTURR VALIDT
 * Implements comprehensive security headers to protect against common web vulnerabilities
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Security headers middleware
 * Adds essential security headers to all responses
 */
export function securityHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Content Security Policy (CSP)
  // Restricts sources of content to prevent XSS attacks
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.manus.im https://api.perplexity.ai https://*.manus.computer https://*.manus-asia.computer wss://*.manus.computer wss://*.manus-asia.computer",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  
  res.setHeader("Content-Security-Policy", cspDirectives);

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-Frame-Options
  // Prevents clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");

  // X-XSS-Protection
  // Enables browser's built-in XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict-Transport-Security (HSTS)
  // Forces HTTPS connections
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Referrer-Policy
  // Controls how much referrer information is shared
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (formerly Feature-Policy)
  // Restricts browser features and APIs
  const permissionsPolicy = [
    "geolocation=()",
    "microphone=()",
    "camera=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", ");
  
  res.setHeader("Permissions-Policy", permissionsPolicy);

  // Remove X-Powered-By header to hide server technology
  res.removeHeader("X-Powered-By");

  next();
}

/**
 * HTTPS enforcement middleware
 * Redirects HTTP requests to HTTPS in production
 */
export function httpsEnforcementMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  // Check if request is already HTTPS
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";

  if (!isHttps) {
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  next();
}

/**
 * CORS configuration for API endpoints
 * Allows cross-origin requests from trusted domains only
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowedOrigins = [
    process.env.VITE_APP_URL || "http://localhost:3000",
    "https://manus.im",
    "https://api.manus.im",
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    );
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
}

/**
 * Rate limiting per user (in addition to IP-based rate limiting)
 * Prevents abuse from authenticated users
 */
const userRateLimits = new Map<number, { count: number; resetAt: number }>();

export function userRateLimitMiddleware(
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
) {
  // Skip if no user (handled by IP rate limiting)
  if (!req.user?.id) {
    return next();
  }

  const userId = req.user.id;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute per user

  const userLimit = userRateLimits.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset window
    userRateLimits.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return next();
  }

  if (userLimit.count >= maxRequests) {
    return res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: Math.ceil((userLimit.resetAt - now) / 1000),
    });
  }

  userLimit.count++;
  next();
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const expiredUsers: number[] = [];
  
  userRateLimits.forEach((limit, userId) => {
    if (now > limit.resetAt) {
      expiredUsers.push(userId);
    }
  });
  
  expiredUsers.forEach(userId => userRateLimits.delete(userId));
}, 5 * 60 * 1000); // Every 5 minutes
