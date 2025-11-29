import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerSimpleAuth } from "./simpleAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import crypto from "crypto";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Generate CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 * For state-changing requests (POST, PUT, DELETE, PATCH), validates CSRF token
 */
function csrfProtection(req: express.Request, res: express.Response, next: express.NextFunction): void {
  // Skip CSRF for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF for OAuth callbacks (handled by state parameter)
  if (req.path.startsWith('/api/oauth/')) {
    return next();
  }

  // In production, validate CSRF token from header or body
  if (process.env.NODE_ENV === 'production') {
    const headerToken = req.headers['x-csrf-token'] as string | undefined;
    const cookieToken = req.cookies?.['csrf-token'];

    // For API routes, require either same-origin or valid CSRF token
    if (req.path.startsWith('/api/')) {
      const origin = req.headers.origin;
      const host = req.headers.host;
      
      // Allow same-origin requests
      if (origin) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        const isSameOrigin = allowedOrigins.some(allowed => origin === allowed);
        
        if (!isSameOrigin && headerToken !== cookieToken) {
          res.status(403).json({ error: 'CSRF token mismatch' });
          return;
        }
      }
    }
  }

  next();
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);
  
  // Enable gzip/brotli compression
  app.use(compression({
    level: 6, // Compression level (0-9, 6 is good balance)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  
  // Add cache headers for static assets
  app.use((req, res, next) => {
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      // Cache static assets for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.startsWith('/api/')) {
      // Don't cache API responses
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      // Cache HTML for 5 minutes
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
    next();
  });
  
  // Security middleware with enhanced CSP for Mapbox
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://api.mapbox.com", "blob:"],
        imgSrc: ["'self'", "data:", "https:", "blob:", "https://api.mapbox.com", "https://*.tiles.mapbox.com"],
        connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com", "https://*.tiles.mapbox.com", "https://api.sendgrid.com"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Additional security headers
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));
  
  // CORS configuration
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
  
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    exposedHeaders: ['X-CSRF-Token'],
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static assets
      return req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/) !== null;
    },
  });
  
  // Apply rate limiting to API routes
  app.use('/api/', limiter);
  
  // Stricter rate limiting for authentication routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/oauth/', authLimiter);
  
  // Stricter rate limiting for sensitive operations (quote sending, etc.)
  const sensitiveOperationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 operations per hour
    message: { error: 'Too many sensitive operations. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply to quote/email endpoints (via path matching in tRPC)
  app.use('/api/trpc/quotes.send', sensitiveOperationLimiter);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // CSRF token endpoint
  app.get('/api/csrf-token', (req, res) => {
    const token = generateCsrfToken();
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });
    res.json({ csrfToken: token });
  });
  
  // Apply CSRF protection
  app.use(csrfProtection);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Simple authentication bypass
  registerSimpleAuth(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Health check endpoint for deployment monitoring
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
