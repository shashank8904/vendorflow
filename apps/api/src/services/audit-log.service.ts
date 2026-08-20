import { auditLogRepository } from "../repositories/audit-log.repository";
import { buildPaginationParams, buildPaginationMeta } from "../utils/paginator";
import logger from "../lib/logger";

/**
 * Audit Log business logic.
 * Provides a `log()` method used by all other services to record mutations.
 */
class AuditLogService {
  /**
   * Create an audit log entry.
   * This method is fire-and-forget — callers should `.catch(() => {})` to avoid
   * blocking the main request if logging fails.
   */
  async log(
    companyId: string,
    action: string,
    entity: string,
    entityId: string,
    changes?: Record<string, unknown>,
    userId?: string,
    ipAddress?: string
  ) {
    try {
      await auditLogRepository.create({
        companyId,
        userId,
        action,
        entity,
        entityId,
        changes,
        ipAddress,
      });
    } catch (error) {
      // Never let audit log failures break the main flow
      logger.error({ error, action, entity, entityId }, "Failed to create audit log");
    }
  }

  /**
   * Query audit logs with pagination and filtering.
   */
  async getAuditLogs(
    companyId: string,
    query: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: "asc" | "desc";
      entity?: string;
      action?: string;
      entityId?: string;
    }
  ) {
    const { skip, take, orderBy, page, limit } = buildPaginationParams(query);

    const [logs, totalItems] = await Promise.all([
      auditLogRepository.findAll(companyId, {
        skip,
        take,
        orderBy,
        entity: query.entity,
        action: query.action,
        entityId: query.entityId,
      }),
      auditLogRepository.count(
        companyId,
        query.entity,
        query.action,
        query.entityId
      ),
    ]);

    const pagination = buildPaginationMeta(totalItems, page, limit);
    return { logs, pagination };
  }
}

export const auditLogService = new AuditLogService();
