import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { prisma } from "../config/db";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { env } from "../config/env";

export const documentsRouter = Router();
documentsRouter.use(authenticate);

const UPLOAD_ROOT = path.resolve(__dirname, "../../", env.uploadDir);
if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const ALLOWED_MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    cb(null, `${req.user!.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new Error("Only PDF, JPEG, PNG or WEBP files are allowed."));
    cb(null, true);
  },
});

const docTypeSchema = z.object({
  type: z.enum([
    "RESUME",
    "PHOTOGRAPH",
    "ID_PROOF",
    "TENTH_MARKSHEET",
    "TWELFTH_MARKSHEET",
    "SEMESTER_MARKSHEET",
    "GRADUATION_CERTIFICATE",
    "OTHER",
  ]),
});

// POST /api/documents — student uploads a document
documentsRouter.post(
  "/",
  authorize("STUDENT"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No file uploaded.");
    const { type } = docTypeSchema.parse(req.body);

    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new ApiError(404, "Student profile not found.");

    const doc = await prisma.document.create({
      data: {
        studentId: student.id,
        type,
        fileName: req.file.originalname,
        storedPath: req.file.filename,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        status: "UPLOADED",
      },
    });

    if (type === "RESUME") {
      await prisma.student.update({ where: { id: student.id }, data: { resumeUrl: doc.id } });
    }

    res.status(201).json({ ok: true, document: doc });
  })
);

// GET /api/documents/mine
documentsRouter.get(
  "/mine",
  authorize("STUDENT"),
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) throw new ApiError(404, "Student profile not found.");
    const documents = await prisma.document.findMany({ where: { studentId: student.id }, orderBy: { uploadedAt: "desc" } });
    res.json({ ok: true, documents });
  })
);

// GET /api/documents/:id/file — authenticated, access-controlled file download
documentsRouter.get(
  "/:id/file",
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id }, include: { student: true } });
    if (!doc) throw new ApiError(404, "Document not found.");

    const isOwner = doc.student.userId === req.user!.id;
    const isStaff = req.user!.role === "TPO" || req.user!.role === "ADMIN";
    if (!isOwner && !isStaff) throw new ApiError(403, "You do not have access to this document.");

    const filePath = path.join(UPLOAD_ROOT, doc.storedPath);
    if (!fs.existsSync(filePath)) throw new ApiError(404, "File missing on server.");
    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${doc.fileName.replace(/[^\w.\-]/g, "_")}"`);
    res.sendFile(filePath);
  })
);

const reviewSchema = z.object({ status: z.enum(["VERIFIED", "REJECTED"]), note: z.string().max(500).optional() });

// PATCH /api/documents/:id/review — TPO/Admin verify or reject
documentsRouter.patch(
  "/:id/review",
  authorize("TPO", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { status, note } = reviewSchema.parse(req.body);
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: { status, reviewNote: note, reviewedById: req.user!.id, reviewedAt: new Date() },
    });
    res.json({ ok: true, document: doc });
  })
);
