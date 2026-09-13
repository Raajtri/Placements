import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "7d",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR ?? "../uploads",
  // "lax" works when the frontend and API share a domain (the default single-service deploy).
  // Set COOKIE_SAMESITE=none when the frontend is hosted separately (e.g. Vercel) from the API
  // (e.g. Railway) — cross-site fetch/XHR never sends a Lax cookie, which would silently break
  // session refresh. "none" requires secure:true, i.e. HTTPS, which is why it's opt-in.
  cookieSameSite: (process.env.COOKIE_SAMESITE as "lax" | "none" | "strict") ?? "lax",
};
