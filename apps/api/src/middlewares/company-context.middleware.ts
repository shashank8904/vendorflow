import type { Request, Response, NextFunction } from "express";
import { ApiResponseBuilder } from "../utils/api-response";

/**
 * Extracts company context from the X-Company-Id request header.
 *
 * This is a development-time placeholder for real authentication.
 * When auth is implemented, this middleware will be replaced by one that
 * extracts companyId from the authenticated JWT token.
 */
export function companyContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const companyId = req.headers["x-company-id"];

  if (!companyId || typeof companyId !== "string") {
    ApiResponseBuilder.error(
      res,
      "Missing X-Company-Id header. Provide a valid company ID.",
      400
    );
    return;
  }

  req.companyId = companyId;
  next();
}
