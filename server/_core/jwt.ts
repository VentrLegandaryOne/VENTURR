import jwt from "jsonwebtoken";
import { ENV } from "./env";

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, ENV.jwtSecret, {
    expiresIn: "7d",
  });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, ENV.jwtSecret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

