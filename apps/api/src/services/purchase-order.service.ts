import { purchaseOrderRepository } from "../repositories/purchase-order.repository";
import { vendorRepository } from "../repositories/vendor.repository";
import { auditLogService } from "./audit-log.service";
import { NotFoundError, ValidationError } from "../errors";
import { AUDIT_ACTIONS, ENTITIES } from "../constants";
import { buildPaginationParams, buildPaginationMeta } from "../utils/paginator";
import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  UpdatePOStatusInput,
  PurchaseOrderQueryInput,
} from "../validators/purchase-order.validator";
import type { PurchaseOrderStatus } from "@prisma/client";

/**
 * Valid status transitions for purchase orders.
 */
const VALID_STATUS_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DELAYED", "CANCELLED"],
  DELAYED: ["CONFIRMED", "CANCELLED"],
  CANCELLED: [], // Terminal state
};

/**
 * Purchase Order business logic.
 */
class PurchaseOrderService {
  /**
   * Create a new purchase order.
   */
  async createPurchaseOrder(
    companyId: string,
    data: CreatePurchaseOrderInput
  ) {
    // Verify vendor exists and belongs to this company
    const vendor = await vendorRepository.findById(companyId, data.vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor", data.vendorId);
    }

    const po = await purchaseOrderRepository.create(companyId, data);

    auditLogService
      .log(companyId, AUDIT_ACTIONS.PO_CREATED, ENTITIES.PURCHASE_ORDER, po.id, {
        vendorId: data.vendorId,
        amount: data.amount,
      })
      .catch(() => {});

    return po;
  }

  /**
   * List purchase orders with pagination, search, and filtering.
   */
  async getPurchaseOrders(
    companyId: string,
    query: PurchaseOrderQueryInput
  ) {
    const { skip, take, orderBy, page, limit } = buildPaginationParams(query);

    const [orders, totalItems] = await Promise.all([
      purchaseOrderRepository.findAll(companyId, {
        skip,
        take,
        orderBy,
        search: query.search,
        status: query.status as PurchaseOrderStatus | undefined,
        vendorId: query.vendorId,
      }),
      purchaseOrderRepository.count(
        companyId,
        query.search,
        query.status as PurchaseOrderStatus | undefined,
        query.vendorId
      ),
    ]);

    const pagination = buildPaginationMeta(totalItems, page, limit);
    return { orders, pagination };
  }

  /**
   * Get a single purchase order by ID.
   */
  async getPurchaseOrderById(companyId: string, id: string) {
    const po = await purchaseOrderRepository.findById(companyId, id);
    if (!po) {
      throw new NotFoundError("Purchase Order", id);
    }
    return po;
  }

  /**
   * Update a purchase order.
   */
  async updatePurchaseOrder(
    companyId: string,
    id: string,
    data: UpdatePurchaseOrderInput
  ) {
    await this.getPurchaseOrderById(companyId, id);

    const po = await purchaseOrderRepository.update(companyId, id, data);

    auditLogService
      .log(companyId, AUDIT_ACTIONS.PO_UPDATED, ENTITIES.PURCHASE_ORDER, id, {
        changes: data,
      })
      .catch(() => {});

    return po;
  }

  /**
   * Update purchase order status with transition validation.
   */
  async updatePurchaseOrderStatus(
    companyId: string,
    id: string,
    data: UpdatePOStatusInput
  ) {
    const existingPO = await this.getPurchaseOrderById(companyId, id);

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[existingPO.status];
    if (!allowedTransitions.includes(data.status as PurchaseOrderStatus)) {
      throw new ValidationError(
        `Cannot transition from '${existingPO.status}' to '${data.status}'. Allowed: ${allowedTransitions.join(", ") || "none (terminal state)"}`
      );
    }

    const po = await purchaseOrderRepository.updateStatus(
      companyId,
      id,
      data.status as PurchaseOrderStatus
    );

    auditLogService
      .log(companyId, AUDIT_ACTIONS.PO_STATUS_UPDATED, ENTITIES.PURCHASE_ORDER, id, {
        from: existingPO.status,
        to: data.status,
      })
      .catch(() => {});

    return po;
  }

  /**
   * Soft-delete a purchase order.
   */
  async deletePurchaseOrder(companyId: string, id: string) {
    await this.getPurchaseOrderById(companyId, id);
    await purchaseOrderRepository.softDelete(companyId, id);

    auditLogService
      .log(companyId, AUDIT_ACTIONS.PO_DELETED, ENTITIES.PURCHASE_ORDER, id)
      .catch(() => {});
  }
}

export const purchaseOrderService = new PurchaseOrderService();
