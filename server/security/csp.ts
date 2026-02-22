/**
 * Content Security Policy (CSP) Configuration
 * Prevents XSS, clickjacking, and other code injection attacks
 */

export interface CSPDirectives {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "font-src"?: string[];
  "connect-src"?: string[];
  "frame-src"?: string[];
  "object-src"?: string[];
  "media-src"?: string[];
  "worker-src"?: string[];
  "form-action"?: string[];
  "frame-ancestors"?: string[];
  "base-uri"?: string[];
  "manifest-src"?: string[];
}

/**
 * Generate CSP header value from directives
 */
export function generateCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

/**
 * Production CSP configuration
 */
export const productionCSP: CSPDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Vite in production
    "https://cdn.jsdelivr.net", // For external libraries
    "https://unpkg.com",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and dynamic styles
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:", // For inline images
    "blob:", // For generated images
    "https:", // Allow HTTPS images from any source
  ],
  "font-src": [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://api.manus.im", // Manus OAuth
    "wss:", // WebSocket connections
  ],
  "frame-src": ["'self'"],
  "object-src": ["'none'"],
  "media-src": ["'self'", "blob:"],
  "worker-src": ["'self'", "blob:"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"], // Prevent clickjacking
  "base-uri": ["'self'"],
  "manifest-src": ["'self'"],
};

/**
 * Development CSP configuration (more permissive)
 */
export const developmentCSP: CSPDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Eval required for HMR
  "style-src": ["'self'", "'unsafe-inline'", "https:"],
  "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
  "font-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'", "ws:", "wss:", "https:", "http:"],
  "frame-src": ["'self'"],
  "object-src": ["'none'"],
  "media-src": ["'self'", "blob:"],
  "worker-src": ["'self'", "blob:"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
};

/**
 * Get CSP configuration based on environment
 */
export function getCSPConfig(): CSPDirectives {
  return process.env.NODE_ENV === "production" ? productionCSP : developmentCSP;
}

/**
 * Additional security headers
 */
export interface SecurityHeaders {
  "X-Content-Type-Options": string;
  "X-Frame-Options": string;
  "X-XSS-Protection": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
  "Strict-Transport-Security"?: string;
}

/**
 * Get recommended security headers
 */
export function getSecurityHeaders(includeHSTS: boolean = false): SecurityHeaders {
  const headers: SecurityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };

  // Only add HSTS in production with HTTPS
  if (includeHSTS && process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}

/**
 * Middleware to set security headers
 */
export function setSecurityHeaders(res: any) {
  const csp = getCSPConfig();
  const cspHeader = generateCSPHeader(csp);
  const securityHeaders = getSecurityHeaders(true);

  res.setHeader("Content-Security-Policy", cspHeader);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}
