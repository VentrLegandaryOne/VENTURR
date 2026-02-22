import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  securityHeadersMiddleware,
  httpsEnforcementMiddleware,
  corsMiddleware,
} from "./securityHeaders";
import { seedAustralianStandards } from "../australianStandards";
import { createRequestLoggingMiddleware } from "../requestLogging";
import { initializeWebhooks } from "../webhookNotifications";

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

async function startServer() {
  // Seed Australian Standards database on startup
  // Initialize webhook notification system
  console.log("[Startup] Initializing webhook notifications...");
  initializeWebhooks();
  console.log("[Startup] Webhook notifications initialized");

  console.log("[Startup] Seeding Australian Standards database...");
  try {
    await seedAustralianStandards();
    console.log("[Startup] Australian Standards seeded successfully");
  } catch (error) {
    console.error("[Startup] Failed to seed Australian Standards:", error);
    // Don't block server startup on seeding failure
  }

  const app = express();
  const server = createServer(app);
  
  // Security middleware (must be first)
  app.use(httpsEnforcementMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);
  
  // Request logging middleware (captures all API requests)
  app.use(createRequestLoggingMiddleware());
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
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
