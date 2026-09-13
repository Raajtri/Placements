import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ ok: false, error: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ ok: false, error: err.message });
  }
  console.error(err);
  const status = err?.status ?? 500;
  const message = process.env.NODE_ENV === "production" ? "Internal server error" : String(err?.message ?? err);
  res.status(status).json({ ok: false, error: message });
}
