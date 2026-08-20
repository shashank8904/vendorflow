import prisma from "../lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Audit Log data access layer.
 * Write-heavy, read-only from the API (no updates or deletes).
 */
export class AuditLogRepository {
  /**
   * Create an audit log entry.
   */
  async create(data: {
    companyId: string;
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: (data.changes as Prisma.InputJsonValue) || undefined,
        ipAddress: data.ipAddress,
      },
    });
  }

  /**
   * Find audit logs with pagination and filtering.
   */
  async findAll(
    companyId: string,
    params: {
      skip: number;
      take: number;
      orderBy: Record<string, "asc" | "desc">;
      entity?: string;
      action?: string;
      entityId?: string;
    }
  ) {
    const where: Prisma.AuditLogWhereInput = { companyId };

    if (params.entity) {
      where.entity = params.entity;
    }
    if (params.action) {
      where.action = params.action;
    }
    if (params.entityId) {
      where.entityId = params.entityId;
    }

    return prisma.auditLog.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    });
  }

  /**
   * Count audit logs matching filters.
   */
  async count(
    companyId: string,
    entity?: string,
    action?: string,
    entityId?: string
  ): Promise<number> {
    const where: Prisma.AuditLogWhereInput = { companyId };

    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (entityId) where.entityId = entityId;

    return prisma.auditLog.count({ where });
  }
}

export const auditLogRepository = new AuditLogRepository();
