import { notificationRepository } from "../repositories/notification.repository";
import { NotFoundError } from "../errors";
import { buildPaginationParams, buildPaginationMeta } from "../utils/paginator";
import type {
  CreateNotificationInput,
  NotificationQueryInput,
} from "../validators/notification.validator";
import type { NotificationType } from "@prisma/client";

/**
 * Notification business logic.
 */
class NotificationService {
  /**
   * Create a notification.
   * Also used internally by other services to create system notifications.
   */
  async createNotification(
    companyId: string,
    data: CreateNotificationInput
  ) {
    return notificationRepository.create(companyId, data);
  }

  /**
   * Convenience method for other services to fire system notifications.
   */
  async createSystemNotification(
    companyId: string,
    title: string,
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" = "INFO",
    metadata?: Record<string, unknown>
  ) {
    return notificationRepository.create(companyId, {
      title,
      message,
      type,
      metadata,
    });
  }

  /**
   * List notifications with pagination and filtering.
   */
  async getNotifications(companyId: string, query: NotificationQueryInput) {
    const { skip, take, orderBy, page, limit } = buildPaginationParams(query);

    const [notifications, totalItems] = await Promise.all([
      notificationRepository.findAll(companyId, {
        skip,
        take,
        orderBy,
        isRead: query.isRead,
        type: query.type as NotificationType | undefined,
      }),
      notificationRepository.count(
        companyId,
        query.isRead,
        query.type as NotificationType | undefined
      ),
    ]);

    const pagination = buildPaginationMeta(totalItems, page, limit);
    return { notifications, pagination };
  }

  /**
   * Get unread notification count.
   */
  async getUnreadCount(companyId: string) {
    const count = await notificationRepository.getUnreadCount(companyId);
    return { unreadCount: count };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(companyId: string, id: string) {
    try {
      return await notificationRepository.markAsRead(companyId, id);
    } catch {
      throw new NotFoundError("Notification", id);
    }
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(companyId: string) {
    const result = await notificationRepository.markAllAsRead(companyId);
    return { markedCount: result.count };
  }

  /**
   * Soft-delete a notification.
   */
  async deleteNotification(companyId: string, id: string) {
    try {
      await notificationRepository.softDelete(companyId, id);
    } catch {
      throw new NotFoundError("Notification", id);
    }
  }
}

export const notificationService = new NotificationService();
