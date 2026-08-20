import type { Request, Response } from "express";
import { healthService } from "../services/health.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Health check controller.
 */
export const healthController = {
  /**
   * GET /health — System health status.
   */
  getHealth: asyncHandler(async (_req: Request, res: Response) => {
    const health = await healthService.getHealthStatus();
    const statusCode = health.status === "healthy" ? 200 : 503;
    ApiResponseBuilder.success(res, health, `System is ${health.status}`);
  }),
};
