import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Dashboard controller.
 */
export const dashboardController = {
  /**
   * GET /dashboard/summary — Card-level counts.
   */
  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await dashboardService.getSummary(req.companyId);
    ApiResponseBuilder.success(res, summary, "Dashboard summary retrieved");
  }),

  /**
   * GET /dashboard/activity — Recent vendor and PO activity.
   */
  getActivity: asyncHandler(async (req: Request, res: Response) => {
    const activity = await dashboardService.getActivity(req.companyId);
    ApiResponseBuilder.success(res, activity, "Dashboard activity retrieved");
  }),

  /**
   * GET /dashboard/metrics — Aggregate metrics.
   */
  getMetrics: asyncHandler(async (req: Request, res: Response) => {
    const metrics = await dashboardService.getMetrics(req.companyId);
    ApiResponseBuilder.success(res, metrics, "Dashboard metrics retrieved");
  }),
};
