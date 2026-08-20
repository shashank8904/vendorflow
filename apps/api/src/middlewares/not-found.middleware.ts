import type { Request, Response } from "express";
import { ApiResponseBuilder } from "../utils/api-response";

/**
 * Catch-all 404 handler for unmatched routes.
 * Must be mounted AFTER all route handlers.
 */
export function notFoundHandler(req: Request, res: Response): void {
  ApiResponseBuilder.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
}
