import type { Request, Response } from "express";
import { callService } from "../services/call.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Call controller.
 */
export const callController = {
  /**
   * GET /calls — List calls for the company.
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { calls, pagination } = await callService.getCalls(
      req.companyId,
      req.query as any
    );
    ApiResponseBuilder.paginated(
      res,
      calls,
      pagination,
      "Calls retrieved successfully"
    );
  }),

  /**
   * GET /calls/:id — Get a single call.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const call = await callService.getCallById(req.companyId, id);
    ApiResponseBuilder.success(res, call, "Call retrieved successfully");
  }),
};
