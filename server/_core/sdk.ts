import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { verifyJWT, signJWT } from "./jwt";
import { getUser } from "../db";

/**
 * Minimal SDK for authentication
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
    // OAuth code exchange - stub for now
    return null;
  },

  async getUserInfo(accessToken: string): Promise<any> {
    // Get user info from OAuth provider - stub for now
    return null;
  },

  createSessionToken(userId: string): string {
    return signJWT({ userId });
  },
};

