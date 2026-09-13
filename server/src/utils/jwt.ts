import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl as any });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as unknown as AccessTokenPayload;
}

// Refresh tokens are random opaque strings stored (as a sha256 fingerprint) in the DB,
// not JWTs — this lets us revoke individual sessions server-side.
export { randomUUID as generateOpaqueToken } from "crypto";
