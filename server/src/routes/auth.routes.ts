import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { hashPassword, verifyPassword, fingerprint } from "../utils/password";
import { signAccessToken, verifyAccessToken, generateOpaqueToken } from "../utils/jwt";
import { authenticate } from "../middleware/auth";
import { env } from "../config/env";
import { recordAudit } from "../services/audit";

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

const REFRESH_COOKIE = "agi_refresh";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: any, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production" || env.cookieSameSite === "none",
    sameSite: env.cookieSameSite,
    maxAge: REFRESH_TTL_MS,
    path: "/api/auth",
  });
}

async function issueSession(res: any, userId: string, role: any) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: fingerprint(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  setRefreshCookie(res, refreshToken);
  return accessToken;
}

// ---------------------------------------------------------------------------
// POST /api/auth/register  — student self-registration only
// ---------------------------------------------------------------------------
const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  enrollmentNo: z.string().min(2).max(40),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  instituteId: z.string().min(1),
  programId: z.string().min(1),
  departmentId: z.string().min(1),
  batch: z.string().min(2).max(20),
  graduationYear: z.number().int().min(2000).max(2100),
  password: z.string().min(8).max(128),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

    const existingEmail = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existingEmail) throw new ApiError(409, "An account with this email already exists.");

    const existingEnrollment = await prisma.student.findUnique({ where: { enrollmentNo: body.enrollmentNo } });
    if (existingEnrollment) throw new ApiError(409, "An account with this enrollment number already exists.");

    const department = await prisma.department.findUnique({ where: { id: body.departmentId } });
    if (!department || department.programId !== body.programId) throw new ApiError(400, "Invalid program/department combination.");

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        student: {
          create: {
            fullName: body.fullName,
            enrollmentNo: body.enrollmentNo,
            phone: body.phone,
            instituteId: body.instituteId,
            programId: body.programId,
            departmentId: body.departmentId,
            batch: body.batch,
            graduationYear: body.graduationYear,
            verificationStatus: "UNVERIFIED",
          },
        },
      },
      include: { student: true },
    });

    await recordAudit(user.id, "STUDENT_REGISTERED", "User", user.id);

    const accessToken = await issueSession(res, user.id, user.role);
    res.status(201).json({
      ok: true,
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, student: user.student },
    });
  })
);

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  identifier: z.string().min(2), // email or enrollment number
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { identifier, password } = loginSchema.parse(req.body);

    let user = await prisma.user.findUnique({ where: { email: identifier.toLowerCase() }, include: { student: true, staffProfile: true } });
    if (!user) {
      const studentByEnrollment = await prisma.student.findUnique({ where: { enrollmentNo: identifier }, include: { user: true } });
      if (studentByEnrollment) {
        user = await prisma.user.findUnique({ where: { id: studentByEnrollment.userId }, include: { student: true, staffProfile: true } });
      }
    }

    if (!user) throw new ApiError(401, "Invalid credentials.");

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) throw new ApiError(401, "Invalid credentials.");

    if (user.status !== "ACTIVE") throw new ApiError(403, "Your account is not active. Contact the Placement Cell.");

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await recordAudit(user.id, "LOGIN", "User", user.id);

    const accessToken = await issueSession(res, user.id, user.role);
    res.json({
      ok: true,
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, student: user.student, staffProfile: user.staffProfile },
    });
  })
);

// ---------------------------------------------------------------------------
// POST /api/auth/refresh — rotate refresh token, issue new access token
// ---------------------------------------------------------------------------
authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new ApiError(401, "No active session.");

    const tokenHash = fingerprint(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || user.status !== "ACTIVE") throw new ApiError(401, "Session invalid.");

    // rotate: revoke old, issue new
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const accessToken = await issueSession(res, user.id, user.role);
    res.json({ ok: true, accessToken });
  })
);

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      const tokenHash = fingerprint(token);
      await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ ok: true });
  })
);

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { student: { include: { institute: true, program: true, department: true } }, staffProfile: true },
    });
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, status: user.status, student: user.student, staffProfile: user.staffProfile } });
  })
);

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password — always returns 200 to avoid user enumeration
// ---------------------------------------------------------------------------
const forgotSchema = z.object({ email: z.string().email() });

authRouter.post(
  "/forgot-password",
  forgotLimiter,
  asyncHandler(async (req, res) => {
    const { email } = forgotSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      const rawToken = generateOpaqueToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: fingerprint(rawToken),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      // In production this token is emailed to the user, never returned in the API response.
      // For local development/demo we log it to the server console instead.
      console.log(`[password reset] token for ${user.email}: ${rawToken}`);
    }

    res.json({ ok: true, message: "If an account exists for this email, a reset link has been sent." });
  })
);

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
const resetSchema = z.object({ token: z.string().min(10), newPassword: z.string().min(8).max(128) });

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, newPassword } = resetSchema.parse(req.body);
    const tokenHash = fingerprint(token);
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new ApiError(400, "This reset link is invalid or has expired.");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
      prisma.refreshToken.updateMany({ where: { userId: record.userId }, data: { revoked: true } }),
    ]);

    await recordAudit(record.userId, "PASSWORD_RESET", "User", record.userId);
    res.json({ ok: true, message: "Password has been reset. Please log in with your new password." });
  })
);
