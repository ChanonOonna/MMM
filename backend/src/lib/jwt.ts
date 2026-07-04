import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: { sub: string; sessionId: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): { sub: string; sessionId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string; sessionId: string };
}

export function refreshExpiryDate(): Date {
  const days = parseInt(REFRESH_EXPIRES_IN.replace(/[^0-9]/g, ""), 10) || 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
