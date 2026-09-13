import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorize } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const announcementsRouter = Router();

announcementsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, institute, program } = req.query as Record<string, string>;
    const where: any = { status: "PUBLISHED" };
    if (category) where.category = category;
    if (institute) where.instituteId = institute;
    if (program) where.programId = program;
    const announcements = await prisma.announcement.findMany({ where, orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
    res.json({ ok: true, announcements });
  })
);

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(3).max(3000),
  category: z.enum(["PLACEMENT_DRIVE", "INTERNSHIP", "TRAINING", "WORKSHOP", "RECRUITMENT", "GENERAL"]).default("GENERAL"),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  instituteId: z.string().optional(),
  programId: z.string().optional(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

announcementsRouter.post(
  "/",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = schema.parse(req.body);
    const announcement = await prisma.announcement.create({ data: { ...body, createdById: req.user!.id } });
    res.status(201).json({ ok: true, announcement });
  })
);

announcementsRouter.patch(
  "/:id",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = schema.partial().parse(req.body);
    const announcement = await prisma.announcement.update({ where: { id: req.params.id }, data: body });
    res.json({ ok: true, announcement });
  })
);

announcementsRouter.delete(
  "/:id",
  authenticate,
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.announcement.delete({ where: { id: req.params.id } }).catch(() => {
      throw new ApiError(404, "Announcement not found.");
    });
    res.json({ ok: true });
  })
);
