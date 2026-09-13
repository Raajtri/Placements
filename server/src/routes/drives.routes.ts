import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { checkEligibility } from "../services/eligibility";
import { recordAudit } from "../services/audit";

export const drivesRouter = Router();

// GET /api/drives — public: only OPEN/UPCOMING/COMPLETED visible; students see personalized eligibility
drivesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, company, program, location } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (company) where.companyId = company;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (program) where.eligibility = { some: { programId: program } };

    const drives = await prisma.drive.findMany({
      where,
      include: { company: true, eligibility: true },
      orderBy: { applicationStart: "desc" },
    });
    res.json({ ok: true, drives });
  })
);

drivesRouter.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const drive = await prisma.drive.findUnique({
      where: { id: req.params.id },
      include: { company: true, eligibility: { include: { institute: true } }, rounds: { orderBy: { sequence: "asc" } } },
    });
    if (!drive) throw new ApiError(404, "Drive not found.");

    let eligibility = null;
    if (req.user!.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
      if (student) eligibility = await checkEligibility(student, drive);
    }

    res.json({ ok: true, drive, eligibility });
  })
);

const eligibilityRuleSchema = z.object({
  instituteId: z.string(),
  programId: z.string().optional(),
  departmentId: z.string().optional(),
  batch: z.string().optional(),
});

const driveSchema = z.object({
  companyId: z.string(),
  jobRole: z.string().min(2).max(150),
  packageMin: z.number().min(0).optional(),
  packageMax: z.number().min(0).optional(),
  location: z.string().max(150).optional(),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]).default("ONSITE"),
  minCgpa: z.number().min(0).max(10).optional(),
  maxBacklogs: z.number().int().min(0).optional(),
  applicationStart: z.string().datetime(),
  applicationEnd: z.string().datetime(),
  driveDate: z.string().datetime().optional(),
  jobDescription: z.string().min(10),
  requiredSkills: z.array(z.string().max(40)).default([]),
  requiredDocuments: z.array(z.enum([
    "RESUME", "PHOTOGRAPH", "ID_PROOF", "TENTH_MARKSHEET", "TWELFTH_MARKSHEET", "SEMESTER_MARKSHEET", "GRADUATION_CERTIFICATE", "OTHER",
  ])).default([]),
  selectionProcess: z.string().max(2000).optional(),
  eligibility: z.array(eligibilityRuleSchema).default([]),
  rounds: z.array(z.object({ name: z.string().max(80), sequence: z.number().int(), scheduledAt: z.string().datetime().optional() })).default([]),
});

drivesRouter.post(
  "/",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = driveSchema.parse(req.body);
    if (new Date(body.applicationStart) >= new Date(body.applicationEnd)) {
      throw new ApiError(400, "Application start must be before the application deadline.");
    }

    const drive = await prisma.drive.create({
      data: {
        companyId: body.companyId,
        jobRole: body.jobRole,
        packageMin: body.packageMin,
        packageMax: body.packageMax,
        location: body.location,
        workMode: body.workMode,
        minCgpa: body.minCgpa,
        maxBacklogs: body.maxBacklogs,
        applicationStart: new Date(body.applicationStart),
        applicationEnd: new Date(body.applicationEnd),
        driveDate: body.driveDate ? new Date(body.driveDate) : undefined,
        jobDescription: body.jobDescription,
        requiredSkills: body.requiredSkills,
        requiredDocuments: body.requiredDocuments,
        selectionProcess: body.selectionProcess,
        status: "UPCOMING",
        eligibility: { create: body.eligibility },
        rounds: { create: body.rounds.map((r) => ({ ...r, scheduledAt: r.scheduledAt ? new Date(r.scheduledAt) : undefined })) },
      },
      include: { eligibility: true, rounds: true },
    });

    await recordAudit(req.user!.id, "DRIVE_CREATED", "Drive", drive.id);
    res.status(201).json({ ok: true, drive });
  })
);

drivesRouter.patch(
  "/:id",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = driveSchema.partial().parse(req.body);
    const { eligibility, rounds, ...rest } = body as any;
    const data: any = { ...rest };
    if (rest.applicationStart) data.applicationStart = new Date(rest.applicationStart);
    if (rest.applicationEnd) data.applicationEnd = new Date(rest.applicationEnd);
    if (rest.driveDate) data.driveDate = new Date(rest.driveDate);

    const drive = await prisma.drive.update({ where: { id: req.params.id }, data });
    await recordAudit(req.user!.id, "DRIVE_UPDATED", "Drive", drive.id);
    res.json({ ok: true, drive });
  })
);

const statusSchema = z.object({ status: z.enum(["UPCOMING", "OPEN", "CLOSED", "COMPLETED"]) });

drivesRouter.patch(
  "/:id/status",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const data: any = { status };
    if (status === "OPEN") data.publishedAt = new Date();
    const drive = await prisma.drive.update({ where: { id: req.params.id }, data });
    await recordAudit(req.user!.id, `DRIVE_${status}`, "Drive", drive.id);
    res.json({ ok: true, drive });
  })
);
