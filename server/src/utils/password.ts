import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Not reversible — used only to store a lookup-safe fingerprint of opaque tokens
// (refresh tokens, password reset tokens) so the raw secret never touches the DB.
export function fingerprint(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
