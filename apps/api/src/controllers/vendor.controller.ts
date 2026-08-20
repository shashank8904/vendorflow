import type { Request, Response } from "express";
import { vendorService } from "../services/vendor.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Vendor controller.
 * Thin layer: receives request → calls service → returns response.
 */
export const vendorController = {
  /**
   * POST /vendors — Create a new vendor.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.createVendor(req.companyId, req.body);
    ApiResponseBuilder.created(res, vendor, "Vendor created successfully");
  }),

  /**
   * GET /vendors — List vendors with pagination, search, and filtering.
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { vendors, pagination } = await vendorService.getVendors(
      req.companyId,
      req.query as any
    );
    ApiResponseBuilder.paginated(res, vendors, pagination, "Vendors retrieved successfully");
  }),

  /**
   * GET /vendors/:id — Get a single vendor.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const vendor = await vendorService.getVendorById(req.companyId, id);
    ApiResponseBuilder.success(res, vendor, "Vendor retrieved successfully");
  }),

  /**
   * PATCH /vendors/:id — Update a vendor.
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const vendor = await vendorService.updateVendor(
      req.companyId,
      id,
      req.body
    );
    ApiResponseBuilder.success(res, vendor, "Vendor updated successfully");
  }),

  /**
   * DELETE /vendors/:id — Soft-delete a vendor.
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await vendorService.deleteVendor(req.companyId, id);
    ApiResponseBuilder.success(res, null, "Vendor deleted successfully");
  }),
};