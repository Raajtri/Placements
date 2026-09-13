import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorize } from "../middleware/auth";

export const statisticsRouter = Router();

// GET /api/statistics — public, filterable
statisticsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { academicYear, institute, program } = req.query as Record<string, string>;
    const where: any = {};
    if (academicYear) where.academicYear = academicYear;
    if (institute) where.instituteId = institute;
    if (program) where.programId = program;
    const stats = await prisma.placementStatistic.findMany({ where, orderBy: { academicYear: "desc" } });
    res.json({ ok: true, statistics: stats });
  })
);

// GET /api/statistics/dashboard — admin/TPO live dashboard aggregates
statisticsRouter.get(
  "/dashboard",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (_req, res) => {
    const [totalStudents, verifiedStudents, activeDrives, applications, shortlisted, selected, companies] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.drive.count({ where: { status: "OPEN" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "SHORTLISTED" } }),
      prisma.application.count({ where: { status: "SELECTED" } }),
      prisma.company.count(),
    ]);

    const placementPercentage = totalStudents > 0 ? Math.round((selected / totalStudents) * 1000) / 10 : 0;

    const recentActivity = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 });

    res.json({
      ok: true,
      dashboard: { totalStudents, verifiedStudents, activeDrives, applications, shortlisted, selected, companies, placementPercentage },
      recentActivity,
    });
  })
);

const statSchema = z.object({
  academicYear: z.string().min(4).max(9),
  instituteId: z.string().optional(),
  programId: z.string().optional(),
  departmentId: z.string().optional(),
  studentsPlaced: z.number().int().min(0).default(0),
  totalOffers: z.number().int().min(0).default(0),
  recruiterCount: z.number().int().min(0).default(0),
  highestPackage: z.number().min(0).optional(),
  averagePackage: z.number().min(0).optional(),
  medianPackage: z.number().min(0).optional(),
  eligibleStudents: z.number().int().min(0).default(0),
  isDemoData: z.boolean().default(true),
});

statisticsRouter.post(
  "/",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = statSchema.parse(req.body);
    const stat = await prisma.placementStatistic.upsert({
      where: {
        academicYear_instituteId_programId_departmentId: {
          academicYear: body.academicYear,
          instituteId: body.instituteId ?? null,
          programId: body.programId ?? null,
          departmentId: body.departmentId ?? null,
        } as any,
      },
      update: body,
      create: body,
    });
    res.status(201).json({ ok: true, statistic: stat });
  })
);
