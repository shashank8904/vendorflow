import prisma from "../lib/prisma";
import type { CreateNotificationInput } from "../validators/notification.validator";
import type { Prisma, NotificationType } from "@prisma/client";

/**
 * Notification data access layer.
 */
export class NotificationRepository {
  /**
   * Create a notification.
   */
  async create(companyId: string, data: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        companyId,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
        metadata: (data.metadata as Prisma.InputJsonValue) || undefined,
      },
    });
  }

  /**
   * Find all notifications with pagination and filtering.
   */
  async findAll(
    companyId: string,
    params: {
      skip: number;
      take: number;
      orderBy: Record<string, "asc" | "desc">;
      isRead?: boolean;
      type?: NotificationType;
    }
  ) {
    const where = this.buildWhereClause(companyId, params.isRead, params.type);

    return prisma.notification.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    });
  }

  /**
   * Count notifications matching filters.
   */
  async count(
    companyId: string,
    isRead?: boolean,
    type?: NotificationType
  ): Promise<number> {
    const where = this.buildWhereClause(companyId, isRead, type);
    return prisma.notification.count({ where });
  }

  /**
   * Get unread notification count.
   */
  async getUnreadCount(companyId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        companyId,
        deletedAt: null,
        isRead: false,
      },
    });
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(companyId: string, id: string) {
    return prisma.notification.update({
      where: {
        id,
        companyId,
        deletedAt: null,
      } as Prisma.NotificationWhereUniqueInput,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a company.
   */
  async markAllAsRead(companyId: string) {
    return prisma.notification.updateMany({
      where: {
        companyId,
        deletedAt: null,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Soft-delete a notification.
   */
  async softDelete(companyId: string, id: string) {
    return prisma.notification.update({
      where: {
        id,
        companyId,
        deletedAt: null,
      } as Prisma.NotificationWhereUniqueInput,
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Build where clause for notification queries.
   */
  private buildWhereClause(
    companyId: string,
    isRead?: boolean,
    type?: NotificationType
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    return where;
  }
}

export const notificationRepository = new NotificationRepository();
