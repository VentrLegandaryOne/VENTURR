import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { verifyJWT, signJWT } from "./jwt";
import { getUser } from "../db";
import { ENV } from "./env";

/**
 * Manus OAuth SDK
 * 
 * Handles authentication with Manus OAuth server
 */
export const sdk = {
  async authenticateRequest(req: Request): Promise<User | null> {
    const token = req.cookies?.["manus_session"];
    if (!token) return null;

    try {
      const payload = verifyJWT(token);
      if (!payload?.userId) return null;

      const user = await getUser(payload.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  },

  async exchangeCodeForToken(code: string): Promise<{ access_token: string } | null> {
    try {
      const response = await fetch(`${ENV.oauthServerUrl}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          client_id: ENV.appId,
          redirect_uri: `${ENV.oauthServerUrl}/api/oauth/callback`,
        }),
      });

      if (!response.ok) {
        console.error("[OAuth] Token exchange failed:", response.status, await response.text());
        return null;
      }

      const data = await response.json();
      return { access_token: data.access_token };
    } catch (error) {
      console.error("[OAuth] Token exchange error:", error);
      return null;
    }
  },

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${ENV.oauthServerUrl}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("[OAuth] Get user info failed:", response.status);
        return null;
      }

      const userInfo = await response.json();
      return {
        openId: userInfo.sub || userInfo.id || userInfo.openId,
        name: userInfo.name,
        email: userInfo.email,
        loginMethod: userInfo.login_method || userInfo.loginMethod,
        platform: userInfo.platform,
      };
    } catch (error) {
      console.error("[OAuth] Get user info error:", error);
      return null;
    }
  },

  createSessionToken(userId: string): string {
    return signJWT({ userId });
  },
};

