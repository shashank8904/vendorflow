import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler to catch rejected promises
 * and forward them to the global error handler.
 *
 * Express 5 handles async errors natively, but this wrapper provides
 * an explicit safety net and makes the pattern visible in route files.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
