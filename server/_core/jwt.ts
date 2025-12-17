// JWT authentication helper - no Manus OAuth

import * as jose from "jose";
import { ENV } from "./env";
import type { Request } from "express";
import { COOKIE_NAME } from "../../shared/const";

const secret = new TextEncoder().encode(ENV.cookieSecret);

export interface SessionPayload {
  userId: number;
  openId: string;
  email: string;
  name: string;
  role: string;
}

export function createSessionToken(payload: SessionPayload): string {
  const token = new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secret);

  return token as any;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jose.jwtVerify(token, secret);
    return verified.payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map(c => {
      const [key, value] = c.split("=");
      return [key, decodeURIComponent(value || "")];
    })
  );

  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  return verifySessionToken(token);
}
