import prisma from "../lib/prisma";
import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "../validators/purchase-order.validator";
import type { Prisma, PurchaseOrderStatus } from "@prisma/client";

/**
 * Purchase Order data access layer.
 * All queries enforce companyId scoping and soft-delete filtering.
 */
export class PurchaseOrderRepository {
  /**
   * Create a new purchase order with an auto-generated PO number.
   */
  async create(companyId: string, data: CreatePurchaseOrderInput) {
    const poNumber = await this.generatePoNumber();

    return prisma.purchaseOrder.create({
      data: {
        companyId,
        vendorId: data.vendorId,
        poNumber,
        description: data.description,
        amount: data.amount,
        expectedDelivery: data.expectedDelivery,
      },
      include: {
        vendor: {
          select: { id: true, name: true, contactPerson: true, phone: true },
        },
      },
    });
  }

  /**
   * Find all purchase orders with pagination, search, and filtering.
   */
  async findAll(
    companyId: string,
    params: {
      skip: number;
      take: number;
      orderBy: Record<string, "asc" | "desc">;
      search?: string;
      status?: PurchaseOrderStatus;
      vendorId?: string;
    }
  ) {
    const where = this.buildWhereClause(
      companyId,
      params.search,
      params.status,
      params.vendorId
    );

    return prisma.purchaseOrder.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        vendor: {
          select: { id: true, name: true, contactPerson: true, phone: true },
        },
        _count: {
          select: { calls: true },
        },
      },
    });
  }

  /**
   * Count purchase orders matching the given filters.
   */
  async count(
    companyId: string,
    search?: string,
    status?: PurchaseOrderStatus,
    vendorId?: string
  ): Promise<number> {
    const where = this.buildWhereClause(companyId, search, status, vendorId);
    return prisma.purchaseOrder.count({ where });
  }

  /**
   * Find a single purchase order by ID.
   */
  async findById(companyId: string, id: string) {
    return prisma.purchaseOrder.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        vendor: true,
        calls: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { result: true },
        },
        _count: {
          select: { calls: true },
        },
      },
    });
  }

  /**
   * Update a purchase order.
   */
  async update(
    companyId: string,
    id: string,
    data: UpdatePurchaseOrderInput
  ) {
    return prisma.purchaseOrder.update({
      where: {
        id,
        companyId,
        deletedAt: null,
      } as Prisma.PurchaseOrderWhereUniqueInput,
      data,
      include: {
        vendor: {
          select: { id: true, name: true, contactPerson: true, phone: true },
        },
      },
    });
  }

  /**
   * Update purchase order status.
   */
  async updateStatus(
    companyId: string,
    id: string,
    status: PurchaseOrderStatus
  ) {
    return prisma.purchaseOrder.update({
      where: {
        id,
        companyId,
        deletedAt: null,
      } as Prisma.PurchaseOrderWhereUniqueInput,
      data: { status },
      include: {
        vendor: {
          select: { id: true, name: true, contactPerson: true, phone: true },
        },
      },
    });
  }

  /**
   * Soft-delete a purchase order.
   */
  async softDelete(companyId: string, id: string) {
    return prisma.purchaseOrder.update({
      where: {
        id,
        companyId,
        deletedAt: null,
      } as Prisma.PurchaseOrderWhereUniqueInput,
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Generate a unique PO number in format PO-YYYYMMDD-XXXX.
   */
  private async generatePoNumber(): Promise<string> {
    const today = new Date();
    const dateStr =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      today.getDate().toString().padStart(2, "0");

    const prefix = `PO-${dateStr}-`;

    // Find the latest PO number with today's prefix
    const latest = await prisma.purchaseOrder.findFirst({
      where: { poNumber: { startsWith: prefix } },
      orderBy: { poNumber: "desc" },
      select: { poNumber: true },
    });

    let sequence = 1;
    if (latest?.poNumber) {
      const lastSeq = parseInt(latest.poNumber.split("-").pop() || "0", 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, "0")}`;
  }

  /**
   * Build Prisma where clause for purchase order queries.
   */
  private buildWhereClause(
    companyId: string,
    search?: string,
    status?: PurchaseOrderStatus,
    vendorId?: string
  ): Prisma.PurchaseOrderWhereInput {
    const where: Prisma.PurchaseOrderWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    return where;
  }
}

export const purchaseOrderRepository = new PurchaseOrderRepository();
