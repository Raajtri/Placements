import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { checkEligibility, getDriveWithEligibility } from "../services/eligibility";
import { recordAudit } from "../services/audit";

export const applicationsRouter = Router();
applicationsRouter.use(authenticate);

const applySchema = z.object({ driveId: z.string() });

// POST /api/applications — student applies to a drive (re-checks eligibility server-side)
applicationsRouter.post(
  "/",
  authorize("STUDENT"),
  asyncHandler(async (req, res) => {
    const { driveId } = applySchema.parse(req.body);
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new ApiError(404, "Student profile not found.");

    const drive = await getDriveWithEligibility(driveId);
    if (!drive) throw new ApiError(404, "Drive not found.");

    const existing = await prisma.application.findUnique({ where: { studentId_driveId: { studentId: student.id, driveId } } });
    if (existing) throw new ApiError(409, "You have already applied to this drive.");

    const result = await checkEligibility(student, drive as any);
    if (!result.eligible) throw new ApiError(403, `You are not eligible for this drive: ${result.reasons.join(" ")}`);

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        driveId,
        status: "APPLIED",
        history: { create: { status: "APPLIED", changedById: req.user!.id } },
      },
      include: { drive: { include: { company: true } } },
    });

    res.status(201).json({ ok: true, application });
  })
);

// GET /api/applications/mine
applicationsRouter.get(
  "/mine",
  authorize("STUDENT"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new ApiError(404, "Student profile not found.");
    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { drive: { include: { company: true } }, history: { orderBy: { changedAt: "asc" } } },
      orderBy: { appliedAt: "desc" },
    });
    res.json({ ok: true, applications });
  })
);

// PATCH /api/applications/:id/withdraw
applicationsRouter.patch(
  "/:id/withdraw",
  authorize("STUDENT"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new ApiError(404, "Student profile not found.");

    const application = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!application || application.studentId !== student.id) throw new ApiError(404, "Application not found.");
    if (["SELECTED", "REJECTED", "WITHDRAWN"].includes(application.status)) {
      throw new ApiError(400, `Cannot withdraw an application in ${application.status} status.`);
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: "WITHDRAWN", history: { create: { status: "WITHDRAWN", changedById: req.user!.id } } },
    });
    res.json({ ok: true, application: updated });
  })
);

// ---------------------------------------------------------------------------
// TPO / Admin: manage applications
// ---------------------------------------------------------------------------

applicationsRouter.get(
  "/",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { driveId, status, program, department, search } = req.query as Record<string, string>;
    const where: any = {};
    if (driveId) where.driveId = driveId;
    if (status) where.status = status;
    if (program) where.student = { ...(where.student ?? {}), programId: program };
    if (department) where.student = { ...(where.student ?? {}), departmentId: department };
    if (search) {
      where.student = {
        ...(where.student ?? {}),
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { enrollmentNo: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: { student: { include: { program: true, department: true } }, drive: { include: { company: true } } },
      orderBy: { appliedAt: "desc" },
    });
    res.json({ ok: true, applications });
  })
);

const statusUpdateSchema = z.object({
  status: z.enum(["APPLIED", "SHORTLISTED", "APTITUDE_TEST", "TECHNICAL_ROUND", "HR_ROUND", "SELECTED", "REJECTED", "WAITLISTED", "WITHDRAWN"]),
  note: z.string().max(500).optional(),
});

applicationsRouter.patch(
  "/:id/status",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { status, note } = statusUpdateSchema.parse(req.body);
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status, history: { create: { status, note, changedById: req.user!.id } } },
      include: { student: { include: { user: true } }, drive: true },
    });

    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        type: "RESULT",
        title: `Application update: ${application.drive.jobRole}`,
        message: `Your application status is now ${status.replace(/_/g, " ")}.`,
      },
    });

    await recordAudit(req.user!.id, "APPLICATION_STATUS_UPDATED", "Application", application.id, status);
    res.json({ ok: true, application });
  })
);

const bulkStatusSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  status: z.enum(["APPLIED", "SHORTLISTED", "APTITUDE_TEST", "TECHNICAL_ROUND", "HR_ROUND", "SELECTED", "REJECTED", "WAITLISTED", "WITHDRAWN"]),
});

applicationsRouter.post(
  "/bulk-status",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { applicationIds, status } = bulkStatusSchema.parse(req.body);
    const applications = await prisma.application.findMany({ where: { id: { in: applicationIds } }, include: { student: true, drive: true } });

    await prisma.$transaction([
      prisma.application.updateMany({ where: { id: { in: applicationIds } }, data: { status } }),
      ...applications.map((a) =>
        prisma.applicationStatusHistory.create({ data: { applicationId: a.id, status, changedById: req.user!.id } })
      ),
      ...applications.map((a) =>
        prisma.notification.create({
          data: {
            userId: a.student.userId,
            type: "RESULT",
            title: `Application update: ${a.drive.jobRole}`,
            message: `Your application status is now ${status.replace(/_/g, " ")}.`,
          },
        })
      ),
    ]);

    await recordAudit(req.user!.id, "APPLICATION_BULK_STATUS_UPDATED", "Application", undefined, `${applicationIds.length} applications -> ${status}`);
    res.json({ ok: true, updated: applicationIds.length });
  })
);
