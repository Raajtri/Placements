import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorize } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { hashPassword } from "../utils/password";
import { recordAudit } from "../services/audit";

export const adminRouter = Router();
adminRouter.use(authenticate, authorize("ADMIN"));

// Admin/TPO accounts are never created through public signup — only here, by an existing Admin.
const staffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["TPO", "ADMIN"]),
  fullName: z.string().min(2).max(120),
  designation: z.string().min(2).max(120),
  instituteId: z.string().optional(),
  phone: z.string().max(20).optional(),
  isPublicTeamMember: z.boolean().default(false),
});

adminRouter.post(
  "/staff",
  asyncHandler(async (req, res) => {
    const body = staffSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) throw new ApiError(409, "An account with this email already exists.");

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        role: body.role,
        status: "ACTIVE",
        staffProfile: {
          create: {
            fullName: body.fullName,
            designation: body.designation,
            instituteId: body.instituteId,
            phone: body.phone,
            isPublicTeamMember: body.isPublicTeamMember,
          },
        },
      },
      include: { staffProfile: true },
    });

    await recordAudit(req.user!.id, "STAFF_ACCOUNT_CREATED", "User", user.id, body.role);
    res.status(201).json({ ok: true, user: { id: user.id, email: user.email, role: user.role, staffProfile: user.staffProfile } });
  })
);

adminRouter.get(
  "/staff",
  asyncHandler(async (_req, res) => {
    const staff = await prisma.user.findMany({ where: { role: { in: ["TPO", "ADMIN"] } }, include: { staffProfile: true } });
    res.json({ ok: true, staff });
  })
);

adminRouter.patch(
  "/staff/:userId/status",
  asyncHandler(async (req, res) => {
    const active = Boolean(req.body?.active);
    const user = await prisma.user.update({ where: { id: req.params.userId }, data: { status: active ? "ACTIVE" : "SUSPENDED" } });
    await recordAudit(req.user!.id, active ? "STAFF_ACTIVATED" : "STAFF_SUSPENDED", "User", user.id);
    res.json({ ok: true });
  })
);

// Academic structure management
const instituteSchema = z.object({ name: z.string().min(2), code: z.string().min(2).max(20), address: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional() });
adminRouter.post("/institutes", asyncHandler(async (req, res) => {
  const body = instituteSchema.parse(req.body);
  const institute = await prisma.institute.create({ data: body });
  res.status(201).json({ ok: true, institute });
}));

const programSchema = z.object({ name: z.string().min(2), instituteId: z.string() });
adminRouter.post("/programs", asyncHandler(async (req, res) => {
  const body = programSchema.parse(req.body);
  const program = await prisma.program.create({ data: body });
  res.status(201).json({ ok: true, program });
}));

const departmentSchema = z.object({ name: z.string().min(2), programId: z.string() });
adminRouter.post("/departments", asyncHandler(async (req, res) => {
  const body = departmentSchema.parse(req.body);
  const department = await prisma.department.create({ data: body });
  res.status(201).json({ ok: true, department });
}));

adminRouter.get(
  "/audit-logs",
  asyncHandler(async (req, res) => {
    const { entityType, take = "50" } = req.query as Record<string, string>;
    const where: any = {};
    if (entityType) where.entityType = entityType;
    const logs = await prisma.auditLog.findMany({ where, include: { actor: { select: { email: true, role: true } } }, orderBy: { createdAt: "desc" }, take: Math.min(200, Number(take) || 50) });
    res.json({ ok: true, logs });
  })
);
