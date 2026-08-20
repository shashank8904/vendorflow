import prisma from "../lib/prisma";
import type { CallStatus, Prisma } from "@prisma/client";

/**
 * Call data access layer.
 * Calls are scoped to a company via their parent PurchaseOrder.
 */
export class CallRepository {
  /**
   * Find all calls for a company with pagination and optional filters.
   * Company scoping is enforced through purchaseOrder.companyId.
   */
  async findAll(
    companyId: string,
    params: {
      skip: number;
      take: number;
      orderBy: Record<string, "asc" | "desc">;
      status?: CallStatus;
      purchaseOrderId?: string;
      vendorId?: string;
    }
  ) {
    const where = this.buildWhereClause(
      companyId,
      params.status,
      params.purchaseOrderId,
      params.vendorId
    );

    return prisma.call.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            companyId: true,
            vendor: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        result: true,
      },
    });
  }

  /**
   * Count calls matching the given filters for a company.
   */
  async count(
    companyId: string,
    status?: CallStatus,
    purchaseOrderId?: string,
    vendorId?: string
  ): Promise<number> {
    const where = this.buildWhereClause(
      companyId,
      status,
      purchaseOrderId,
      vendorId
    );
    return prisma.call.count({ where });
  }

  /**
   * Find a single call by ID, scoped to a company.
   */
  async findById(companyId: string, id: string) {
    return prisma.call.findFirst({
      where: {
        id,
        purchaseOrder: { companyId },
      },
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            companyId: true,
            vendor: {
              select: { id: true, name: true, phone: true, contactPerson: true },
            },
          },
        },
        result: true,
      },
    });
  }

  /**
   * Build Prisma where clause for call queries.
   * Company scoping is enforced through the purchaseOrder relation.
   */
  private buildWhereClause(
    companyId: string,
    status?: CallStatus,
    purchaseOrderId?: string,
    vendorId?: string
  ): Prisma.CallWhereInput {
    const where: Prisma.CallWhereInput = {
      purchaseOrder: { companyId },
    };

    if (status) {
      where.status = status;
    }

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    return where;
  }
}

export const callRepository = new CallRepository();
