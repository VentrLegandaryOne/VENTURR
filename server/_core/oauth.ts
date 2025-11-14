import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    console.log("[OAuth] Callback received", { query: req.query, headers: { proto: req.headers['x-forwarded-proto'], host: req.headers['x-forwarded-host'] } });
    
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      console.error("[OAuth] Missing code or state", { code: !!code, state: !!state });
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Construct the callback URL from the request
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const callbackUrl = `${protocol}://${host}/api/oauth/callback`;
      console.log("[OAuth] Callback URL:", callbackUrl);
      
      console.log("[OAuth] Exchanging code for token...");
      const tokenResponse = await sdk.exchangeCodeForToken(code, callbackUrl);
      if (!tokenResponse) {
        console.error("[OAuth] Token exchange returned null");
        res.status(500).json({ error: "Failed to exchange code for token" });
        return;
      }
      console.log("[OAuth] Token exchange successful, fetching user info...");
      const userInfo = await sdk.getUserInfo(tokenResponse.access_token);

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId from user info", userInfo);
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      console.log("[OAuth] User info retrieved:", { openId: userInfo.openId, name: userInfo.name });

      await db.upsertUser({
        id: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = sdk.createSessionToken(userInfo.openId);

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[OAuth] Login successful, redirecting to dashboard");
      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
