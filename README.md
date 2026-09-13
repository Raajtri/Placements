# AGI Placement Cell — Placement Portal (Phase 1)

Official placement portal for **Aditya Group of Institution (AGI)**, covering the constituent
institutes AIMSR (Aditya Institute of Management Technology and Research) and ACAAD (Aditya
College of Art, Architecture and Design).

This is Phase 1: a working full-stack foundation with real authentication, role-based access
control, and functional student/admin/TPO portals — not a static mockup.

## Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite + React Router
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT access tokens (15 min) + httpOnly rotating refresh token cookies, bcrypt password
  hashing, server-side RBAC middleware on every protected route

## Project layout

```
server/   Express API, Prisma schema, seed script
client/   React + Vite frontend
docker-compose.yml   Local PostgreSQL container
uploads/  Student document uploads (access-controlled, never served statically)
```

## First-time setup

1. **Start PostgreSQL** (Docker Desktop must be running):
   ```
   docker compose up -d
   ```
   > Note: the container publishes on host port **5433**, not 5432 — this avoids colliding with
   > a native PostgreSQL install that may already be listening on 5432. If you don't have a
   > conflicting local Postgres, feel free to remap to 5432 in `docker-compose.yml` (and update
   > `server/.env` to match).

2. **Server:**
   ```
   cd server
   cp .env.example .env
   npm install
   npm run prisma:migrate     # creates schema
   npm run seed                # loads institutes, demo admin/TPO/student accounts, demo drive
   npm run dev                  # http://localhost:4000
   ```

3. **Client:**
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev                  # http://localhost:5173 (proxies /api to :4000)
   ```

## Demo credentials (seeded — rotate before any real deployment)

| Role    | Identifier                        | Password       |
|---------|------------------------------------|----------------|
| Admin   | admin@agiplacements.demo           | AgiAdmin@123   |
| TPO     | tpo@agiplacements.demo             | AgiTpo@123     |
| Student | student1@agiplacements.demo (verified) | Student@123 |
| Student | student2@agiplacements.demo (pending)  | Student@123 |
| Student | student3@agiplacements.demo (verified) | Student@123 |

Admin/TPO accounts are never created through public signup — only via `POST /api/admin/staff`
(admin-only) or the seed script, per the spec.

## What's implemented in Phase 1

- Real registration, login (email or enrollment number), JWT + rotating refresh cookie sessions,
  logout, forgot/reset password (token emailed in production, logged to console in dev), protected
  routes enforced **server-side** (not just hidden buttons)
- Role-based access control (STUDENT / TPO / ADMIN) on every API route
- Student profile with completion percentage, document upload with access-controlled file serving
  and TPO/Admin verify-or-reject workflow
- Server-side eligibility engine (institute/program/department/batch/CGPA/backlogs/verification
  status/deadlines) — re-checked on every application submission, not just displayed client-side
- Placement drives (create/edit/publish/close), applications with full status history, bulk status
  updates, audit logging of sensitive admin actions
- Public marketing site (Home, About, Placements, Companies, Statistics, Reports, Policy, Industry
  Speaks, Alumni Testimonials, Team, Contact) — all data-driven from the API, with honest
  "Data to be updated" empty states rather than fabricated numbers
- Recruiter portal: architecturally reserved (Company/Drive schema already supports it) but not
  exposed with its own auth flow yet, per the spec

## Deploying to Railway

The app deploys as a **single Railway service**: in production the Express server also serves
the built React app (see `server/src/index.ts`), so there's no separate frontend deployment, no
cross-origin cookie issues, and one process to manage.

1. **Push this repo to GitHub** (Railway deploys from a git repo).
2. **Create a new Railway project** → "Deploy from GitHub repo" → select this repo.
3. **Add a PostgreSQL plugin** to the project (Railway → New → Database → PostgreSQL). Railway
   injects `DATABASE_URL` into your service automatically — no manual wiring needed.
4. **Set environment variables** on the service (Railway → Variables):
   - `JWT_ACCESS_SECRET` — long random string
   - `JWT_REFRESH_SECRET` — long random string (different from the above)
   - `NODE_ENV=production`
   - `CLIENT_ORIGIN` — your Railway-assigned domain, e.g. `https://your-app.up.railway.app`
   - `ACCESS_TOKEN_TTL=15m`, `REFRESH_TOKEN_TTL=7d` (optional, these are the defaults)
   - `UPLOAD_DIR=../uploads` (default; see the volume note below)
5. Railway auto-detects the root `package.json` and runs `npm run build` then `npm start`
   (also defined explicitly in `railway.json` if you want to double check). `npm start` runs
   `prisma migrate deploy` before launching the server, so your schema is applied automatically
   on every deploy.
6. **Seed the database once** after the first deploy: open a shell on the Railway service (or run
   locally with `DATABASE_URL` pointed at the Railway Postgres instance) and run:
   ```
   npm run seed --prefix server
   ```
   Then log in with the demo credentials above and change the admin password, or create real
   staff accounts via `POST /api/admin/staff` and deactivate the demo ones.

### Uploaded documents and file storage

Student document uploads are written to local disk (`uploads/`). Railway's filesystem is
**ephemeral** — files can be lost on redeploy or restart unless you attach a
[Railway Volume](https://docs.railway.app/reference/volumes) mounted at the path `UPLOAD_DIR`
resolves to. For anything beyond a demo, migrate `server/src/routes/documents.routes.ts` to
object storage (S3 / Cloudflare R2) instead — the upload/download interface is small and
isolated, so that swap doesn't touch the rest of the app.

## Real data vs. demo data

Institute names, addresses, and program names are sourced from the official AIMSR and ACAAD
websites. Companies, drives, statistics, and testimonials seeded for demonstration are clearly
named "Demo ..." or flagged `isDemoData: true` and must be replaced with verified Placement Cell
data before production use.
