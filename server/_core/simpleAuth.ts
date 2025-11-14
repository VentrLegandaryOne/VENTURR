import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

/**
 * Simple authentication bypass for development/testing
 * Allows direct platform access without OAuth
 */
export function registerSimpleAuth(app: Express) {
  // Simple sign-in endpoint - creates a session for the owner
  app.post("/api/auth/simple-signin", async (req: Request, res: Response) => {
    try {
      const userId = ENV.ownerId || "demo-user-" + Date.now();
      const userName = ENV.ownerName || "Demo User";

      // Upsert user in database
      await db.upsertUser({
        id: userId,
        name: userName,
        email: "demo@venturr.app",
        loginMethod: "simple",
        lastSignedIn: new Date(),
        role: "admin",
      });

      // Create session token
      const sessionToken = sdk.createSessionToken(userId);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, userId, userName });
    } catch (error) {
      console.error("[SimpleAuth] Sign-in failed:", error);
      res.status(500).json({ error: "Sign-in failed" });
    }
  });

  // Sign-out endpoint
  app.post("/api/auth/signout", async (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}

