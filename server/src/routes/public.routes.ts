import { Router } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";

export const publicRouter = Router();

publicRouter.get(
  "/institutes",
  asyncHandler(async (_req, res) => {
    const institutes = await prisma.institute.findMany({ include: { programs: { include: { departments: true } } }, orderBy: { name: "asc" } });
    res.json({ ok: true, institutes });
  })
);

publicRouter.get(
  "/team",
  asyncHandler(async (_req, res) => {
    const team = await prisma.staffProfile.findMany({
      where: { isPublicTeamMember: true },
      include: { institute: true, user: { select: { email: true } } },
    });
    res.json({ ok: true, team });
  })
);

publicRouter.get(
  "/policy",
  asyncHandler(async (_req, res) => {
    const sections = await prisma.placementPolicy.findMany({ orderBy: { section: "asc" } });
    res.json({ ok: true, sections });
  })
);

publicRouter.get(
  "/reports",
  asyncHandler(async (req, res) => {
    const { academicYear, institute, program } = req.query as Record<string, string>;
    const where: any = {};
    if (academicYear) where.academicYear = academicYear;
    if (institute) where.instituteId = institute;
    if (program) where.programId = program;
    const reports = await prisma.placementReport.findMany({ where, orderBy: { publishedAt: "desc" } });
    res.json({ ok: true, reports });
  })
);

publicRouter.get(
  "/industry-testimonials",
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.industryTestimonial.findMany({ where: { isPublished: true }, include: { company: true }, orderBy: { givenAt: "desc" } });
    res.json({ ok: true, testimonials });
  })
);

publicRouter.get(
  "/alumni-testimonials",
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.alumniTestimonial.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
    res.json({ ok: true, testimonials });
  })
);
