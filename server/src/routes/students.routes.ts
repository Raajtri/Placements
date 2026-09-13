import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { computeProfileCompletion } from "../services/profileCompletion";
import { recordAudit } from "../services/audit";

export const studentsRouter = Router();
studentsRouter.use(authenticate);

async function requireOwnStudent(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new ApiError(404, "Student profile not found.");
  return student;
}

// GET /api/students/me
studentsRouter.get(
  "/me",
  authorize("STUDENT"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: { institute: true, program: true, department: true, documents: true },
    });
    if (!student) throw new ApiError(404, "Student profile not found.");
    res.json({ ok: true, student });
  })
);

const profileUpdateSchema = z.object({
  dob: z.string().datetime().optional(),
  gender: z.string().max(30).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  semester: z.number().int().min(1).max(12).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  tenthPercent: z.number().min(0).max(100).optional(),
  twelfthPercent: z.number().min(0).max(100).optional(),
  diplomaPercent: z.number().min(0).max(100).optional(),
  backlogs: z.number().int().min(0).max(50).optional(),
  skills: z.array(z.string().max(40)).max(30).optional(),
  certifications: z.array(z.string().max(100)).max(30).optional(),
  projects: z.string().max(2000).optional(),
  internships: z.string().max(2000).optional(),
  linkedinUrl: z.string().url().max(300).optional().or(z.literal("")),
  githubUrl: z.string().url().max(300).optional().or(z.literal("")),
  portfolioUrl: z.string().url().max(300).optional().or(z.literal("")),
});

// PATCH /api/students/me — student edits own profile (academic verification fields excluded)
studentsRouter.patch(
  "/me",
  authorize("STUDENT"),
  asyncHandler(async (req, res) => {
    const body = profileUpdateSchema.parse(req.body);
    const existing = await requireOwnStudent(req.user!.id);

    const data: any = { ...body };
    if (body.dob) data.dob = new Date(body.dob);

    const updated = await prisma.student.update({ where: { id: existing.id }, data });
    const completion = computeProfileCompletion(updated);
    const final = await prisma.student.update({ where: { id: existing.id }, data: { profileCompletionPercent: completion } });

    res.json({ ok: true, student: final });
  })
);

// ---------------------------------------------------------------------------
// TPO / Admin: list & manage students
// ---------------------------------------------------------------------------

// GET /api/students?institute=&program=&department=&batch=&status=&search=
studentsRouter.get(
  "/",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { institute, program, department, batch, status, search, page = "1", pageSize = "20" } = req.query as Record<string, string>;

    const where: any = {};
    if (institute) where.instituteId = institute;
    if (program) where.programId = program;
    if (department) where.departmentId = department;
    if (batch) where.batch = batch;
    if (status) where.verificationStatus = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { enrollmentNo: { contains: search, mode: "insensitive" } },
      ];
    }

    const take = Math.min(100, Number(pageSize) || 20);
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { institute: true, program: true, department: true, user: { select: { email: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.student.count({ where }),
    ]);

    res.json({ ok: true, items, total, page: Number(page), pageSize: take });
  })
);

// GET /api/students/:id
studentsRouter.get(
  "/:id",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { institute: true, program: true, department: true, documents: true, applications: { include: { drive: { include: { company: true } } } }, user: { select: { email: true, status: true } } },
    });
    if (!student) throw new ApiError(404, "Student not found.");
    res.json({ ok: true, student });
  })
);

const verifySchema = z.object({ status: z.enum(["VERIFIED", "REJECTED", "PENDING"]) });

// PATCH /api/students/:id/verify
studentsRouter.patch(
  "/:id/verify",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { status } = verifySchema.parse(req.body);
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { verificationStatus: status, verifiedById: req.user!.id, verifiedAt: new Date() },
    });
    await recordAudit(req.user!.id, `STUDENT_${status}`, "Student", student.id);
    res.json({ ok: true, student });
  })
);

const statusSchema = z.object({ active: z.boolean() });

// PATCH /api/students/:id/account-status — activate/deactivate the underlying user account
studentsRouter.patch(
  "/:id/account-status",
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const { active } = statusSchema.parse(req.body);
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw new ApiError(404, "Student not found.");
    await prisma.user.update({ where: { id: student.userId }, data: { status: active ? "ACTIVE" : "SUSPENDED" } });
    await recordAudit(req.user!.id, active ? "ACCOUNT_ACTIVATED" : "ACCOUNT_SUSPENDED", "User", student.userId);
    res.json({ ok: true });
  })
);
