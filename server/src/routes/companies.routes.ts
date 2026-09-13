import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { recordAudit } from "../services/audit";

export const companiesRouter = Router();

// GET /api/companies — public listing with search/filter
companiesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, industry } = req.query as Record<string, string>;
    const where: any = {};
    if (industry) where.industry = industry;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const companies = await prisma.company.findMany({
      where,
      include: { drives: { select: { id: true, status: true, jobRole: true, packageMin: true, packageMax: true, driveDate: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ ok: true, companies });
  })
);

companiesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { drives: true, testimonials: { where: { isPublished: true } } },
    });
    if (!company) throw new ApiError(404, "Company not found.");
    res.json({ ok: true, company });
  })
);

const companySchema = z.object({
  name: z.string().min(2).max(150),
  logoUrl: z.string().url().max(400).optional().or(z.literal("")),
  industry: z.string().max(80).optional(),
  website: z.string().url().max(300).optional().or(z.literal("")),
  description: z.string().max(3000).optional(),
});

companiesRouter.post(
  "/",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = companySchema.parse(req.body);
    const company = await prisma.company.create({ data: body });
    await recordAudit(req.user!.id, "COMPANY_CREATED", "Company", company.id);
    res.status(201).json({ ok: true, company });
  })
);

companiesRouter.patch(
  "/:id",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = companySchema.partial().parse(req.body);
    const company = await prisma.company.update({ where: { id: req.params.id }, data: body });
    await recordAudit(req.user!.id, "COMPANY_UPDATED", "Company", company.id);
    res.json({ ok: true, company });
  })
);

companiesRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.company.delete({ where: { id: req.params.id } });
    await recordAudit(req.user!.id, "COMPANY_DELETED", "Company", req.params.id);
    res.json({ ok: true });
  })
);
