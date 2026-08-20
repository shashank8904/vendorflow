import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors";
import { ApiResponseBuilder } from "../utils/api-response";
import logger from "../lib/logger";

/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and sends a consistent response.
 *
 * Handles:
 * - AppError subclasses (operational errors)
 * - ZodError (validation errors) — Zod v4 uses `issues` instead of `errors`
 * - Prisma known request errors
 * - Unknown/unexpected errors
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── AppError (our custom errors) ────────────────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, url: req.originalUrl }, "Non-operational error");
    }
    ApiResponseBuilder.error(res, err.message, err.statusCode, err.errors);
    return;
  }

  // ── Zod validation errors (v4: uses `issues` array) ────────────────────
  if (err instanceof ZodError) {
    const issues = (err as any).issues || [];
    const errors = issues.map((issue: { path?: (string | number)[]; message?: string }) => {
      const path = (issue.path || []).join(".");
      return path ? `${path}: ${issue.message}` : (issue.message || "Validation error");
    });
    ApiResponseBuilder.error(res, "Validation failed", 400, errors);
    return;
  }

  // ── Prisma known errors ────────────────────────────────────────────────
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as unknown as { code: string; meta?: { target?: string[] } };

    switch (prismaErr.code) {
      case "P2002": {
        const fields = prismaErr.meta?.target?.join(", ") || "field";
        ApiResponseBuilder.error(
          res,
          `A record with this ${fields} already exists`,
          409
        );
        return;
      }
      case "P2025":
        ApiResponseBuilder.error(res, "Record not found", 404);
        return;
      default:
        break;
    }
  }

  // ── Unknown errors ─────────────────────────────────────────────────────
  logger.error({ err, url: req.originalUrl, method: req.method }, "Unhandled error");
  ApiResponseBuilder.error(res, "Internal server error", 500);
}
