import type { Request, Response } from "express";
import { purchaseOrderService } from "../services/purchase-order.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Purchase Order controller.
 */
export const purchaseOrderController = {
  /**
   * POST /purchase-orders — Create a new purchase order.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const po = await purchaseOrderService.createPurchaseOrder(
      req.companyId,
      req.body
    );
    ApiResponseBuilder.created(res, po, "Purchase order created successfully");
  }),

  /**
   * GET /purchase-orders — List purchase orders.
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { orders, pagination } = await purchaseOrderService.getPurchaseOrders(
      req.companyId,
      req.query as any
    );
    ApiResponseBuilder.paginated(
      res,
      orders,
      pagination,
      "Purchase orders retrieved successfully"
    );
  }),

  /**
   * GET /purchase-orders/:id — Get a single purchase order.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const po = await purchaseOrderService.getPurchaseOrderById(
      req.companyId,
      id
    );
    ApiResponseBuilder.success(res, po, "Purchase order retrieved successfully");
  }),

  /**
   * PATCH /purchase-orders/:id — Update a purchase order.
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const po = await purchaseOrderService.updatePurchaseOrder(
      req.companyId,
      id,
      req.body
    );
    ApiResponseBuilder.success(res, po, "Purchase order updated successfully");
  }),

  /**
   * PATCH /purchase-orders/:id/status — Update purchase order status.
   */
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const po = await purchaseOrderService.updatePurchaseOrderStatus(
      req.companyId,
      id,
      req.body
    );
    ApiResponseBuilder.success(res, po, "Purchase order status updated successfully");
  }),

  /**
   * DELETE /purchase-orders/:id — Soft-delete a purchase order.
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await purchaseOrderService.deletePurchaseOrder(
      req.companyId,
      id
    );
    ApiResponseBuilder.success(res, null, "Purchase order deleted successfully");
  }),
};
