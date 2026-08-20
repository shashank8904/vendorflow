import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Analytics controller.
 */
export const analyticsController = {
  /**
   * GET /analytics/monthly-orders
   */
  getMonthlyOrders: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getMonthlyOrders(req.companyId);
    ApiResponseBuilder.success(res, data, "Monthly orders retrieved");
  }),

  /**
   * GET /analytics/vendor-performance
   */
  getVendorPerformance: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getVendorPerformance(req.companyId);
    ApiResponseBuilder.success(res, data, "Vendor performance retrieved");
  }),

  /**
   * GET /analytics/delay-analysis
   */
  getDelayAnalysis: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getDelayAnalysis(req.companyId);
    ApiResponseBuilder.success(res, data, "Delay analysis retrieved");
  }),

  /**
   * GET /analytics/status-distribution
   */
  getStatusDistribution: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getStatusDistribution(req.companyId);
    ApiResponseBuilder.success(res, data, "Status distribution retrieved");
  }),

  /**
   * GET /analytics/call-statistics (placeholder for CALL-E)
   */
  getCallStatistics: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getCallStatistics(req.companyId);
    ApiResponseBuilder.success(res, data, "Call statistics retrieved");
  }),
};
