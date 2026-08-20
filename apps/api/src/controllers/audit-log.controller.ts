import type { Request, Response } from "express";
import { auditLogService } from "../services/audit-log.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Audit Log controller — read-only.
 */
export const auditLogController = {
  /**
   * GET /audit-logs — List audit logs with pagination and filtering.
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { logs, pagination } = await auditLogService.getAuditLogs(
      req.companyId,
      req.query as any
    );
    ApiResponseBuilder.paginated(
      res,
      logs,
      pagination,
      "Audit logs retrieved successfully"
    );
  }),
};
