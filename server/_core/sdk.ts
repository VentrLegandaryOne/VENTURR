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

  async exchangeCodeForToken(code: string, callbackUrl: string): Promise<{ access_token: string } | null> {
    try {
      // Use manus.im for OAuth token exchange (not api.manus.im)
      const oauthBaseUrl = ENV.oauthServerUrl.replace('api.manus.im', 'manus.im');
      const tokenUrl = `${oauthBaseUrl}/oauth/token`;
      const requestBody = {
        grant_type: "authorization_code",
        code,
        client_id: ENV.appId,
        redirect_uri: callbackUrl,
      };
      
      console.log("[OAuth SDK] Token exchange request:", { url: tokenUrl, client_id: ENV.appId, redirect_uri: callbackUrl });
      
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log("[OAuth SDK] Token exchange response:", { status: response.status, body: responseText });
      
      if (!response.ok) {
        console.error("[OAuth SDK] Token exchange failed:", response.status, responseText);
        return null;
      }

      const data = JSON.parse(responseText);
      return { access_token: data.access_token };
    } catch (error) {
      console.error("[OAuth] Token exchange error:", error);
      return null;
    }
  },

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      // Use manus.im for OAuth userinfo endpoint
      const oauthBaseUrl = ENV.oauthServerUrl.replace('api.manus.im', 'manus.im');
      const response = await fetch(`${oauthBaseUrl}/oauth/userinfo`, {
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

