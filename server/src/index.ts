import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";

import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { studentsRouter } from "./routes/students.routes";
import { documentsRouter } from "./routes/documents.routes";
import { companiesRouter } from "./routes/companies.routes";
import { drivesRouter } from "./routes/drives.routes";
import { applicationsRouter } from "./routes/applications.routes";
import { announcementsRouter } from "./routes/announcements.routes";
import { notificationsRouter } from "./routes/notifications.routes";
import { statisticsRouter } from "./routes/statistics.routes";
import { adminRouter } from "./routes/admin.routes";
import { publicRouter } from "./routes/public.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// CSP is disabled here because this process also serves the built React SPA (see below);
// the SPA's own hosting (Vite build output) doesn't need helmet's default script/style
// allowlist, and getting it wrong would break the app rather than harden it.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use("/api", globalLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "agi-placement-server", time: new Date().toISOString() }));

app.use("/api/auth", authRouter);
app.use("/api/students", studentsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/drives", drivesRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/public", publicRouter);

// In production this single service also serves the built React SPA, so the whole app
// runs as one Railway deployment with no cross-origin cookie/CORS concerns.
const clientDist = path.resolve(__dirname, "../../client/dist");
if (env.nodeEnv === "production" && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`AGI Placement Cell API listening on http://localhost:${env.port}`);
});
