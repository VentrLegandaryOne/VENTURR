import { TRPCError } from '@trpc/server';
import { rateLimit } from './rateLimit';
import { checkSessionTimeout } from './sessionTimeout';
import { checkRBACPermission, Role } from './rbac';
import { encryptField, decryptField } from './encryption';

/**
 * Security Middleware Integration
 * Unified security layer for all tRPC procedures
 */

export interface SecurityContext {
  userId: string;
  role: Role;
  organizationId?: string;
  sessionId?: string;
}

/**
 * Rate limiting middleware wrapper
 */
export async function applyRateLimiting(
  userId: string,
  limitType: 'auth' | 'api' | 'strict' | 'upload' | 'export' = 'api'
): Promise<void> {
  const limiter = rateLimit.getLimiter(limitType);
  
  try {
    await limiter.consume(userId, 1);
  } catch (error) {
    if (error instanceof Error && 'remainingPoints' in error) {
      const remaining = (error as any).remainingPoints;
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil((error as any).msBeforeNext / 1000)} seconds.`,
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Rate limiting service error',
    });
  }
}

/**
 * Session timeout check middleware
 */
export async function checkSessionValidity(
  userId: string,
  sessionId?: string
): Promise<void> {
  const isValid = await checkSessionTimeout(userId, sessionId);
  
  if (!isValid) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session expired. Please log in again.',
    });
  }
}

/**
 * RBAC permission check middleware
 */
export async function checkPermission(
  context: SecurityContext,
  requiredPermission: string
): Promise<void> {
  const hasPermission = await checkRBACPermission(
    context.userId,
    context.role,
    requiredPermission
  );
  
  if (!hasPermission) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Insufficient permissions. Required: ${requiredPermission}`,
    });
  }
}

/**
 * Encryption middleware for sensitive fields
 */
export async function encryptSensitiveData(
  data: Record<string, any>,
  fieldsToEncrypt: string[]
): Promise<Record<string, any>> {
  const encrypted = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (field in encrypted && encrypted[field]) {
      encrypted[field] = await encryptField(encrypted[field]);
    }
  }
  
  return encrypted;
}

/**
 * Decryption middleware for sensitive fields
 */
export async function decryptSensitiveData(
  data: Record<string, any>,
  fieldsToDecrypt: string[]
): Promise<Record<string, any>> {
  const decrypted = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (field in decrypted && decrypted[field]) {
      try {
        decrypted[field] = await decryptField(decrypted[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Return encrypted value if decryption fails
      }
    }
  }
  
  return decrypted;
}

/**
 * Comprehensive security check middleware
 */
export async function applySecurityChecks(
  context: SecurityContext,
  options: {
    rateLimit?: 'auth' | 'api' | 'strict' | 'upload' | 'export';
    checkSession?: boolean;
    requiredPermission?: string;
    encryptFields?: string[];
    decryptFields?: string[];
  } = {}
): Promise<void> {
  // Apply rate limiting
  if (options.rateLimit) {
    await applyRateLimiting(context.userId, options.rateLimit);
  }
  
  // Check session validity
  if (options.checkSession) {
    await checkSessionValidity(context.userId, context.sessionId);
  }
  
  // Check RBAC permission
  if (options.requiredPermission) {
    await checkPermission(context, options.requiredPermission);
  }
}

/**
 * Audit logging for security events
 */
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId,
    eventType,
    details,
    severity,
  };
  
  console.log(`[Security] ${severity.toUpperCase()}: ${JSON.stringify(logEntry)}`);
  
  // In production, this would be sent to a security logging service
  // e.g., Sentry, DataDog, CloudWatch, etc.
}

/**
 * Security headers middleware for Express
 */
export function securityHeadersMiddleware(req: any, res: any, next: any) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict-Transport-Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
}

/**
 * CORS middleware configuration
 */
export function corsMiddleware(req: any, res: any, next: any) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.VITE_FRONTEND_URL,
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

/**
 * Input validation middleware
 */
export function validateInput(schema: any) {
  return async (input: any) => {
    try {
      return await schema.parseAsync(input);
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid input: ${error}`,
      });
    }
  };
}

export default {
  applyRateLimiting,
  checkSessionValidity,
  checkPermission,
  encryptSensitiveData,
  decryptSensitiveData,
  applySecurityChecks,
  logSecurityEvent,
  securityHeadersMiddleware,
  corsMiddleware,
  validateInput,
};

