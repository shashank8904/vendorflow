import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { ApiResponseBuilder } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

/**
 * Notification controller.
 */
export const notificationController = {
  /**
   * POST /notifications — Create a notification.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.createNotification(
      req.companyId,
      req.body
    );
    ApiResponseBuilder.created(
      res,
      notification,
      "Notification created successfully"
    );
  }),

  /**
   * GET /notifications — List notifications.
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { notifications, pagination } =
      await notificationService.getNotifications(req.companyId, req.query as any);
    ApiResponseBuilder.paginated(
      res,
      notifications,
      pagination,
      "Notifications retrieved successfully"
    );
  }),

  /**
   * GET /notifications/unread-count — Get unread count.
   */
  getUnreadCount: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationService.getUnreadCount(req.companyId);
    ApiResponseBuilder.success(res, data, "Unread count retrieved");
  }),

  /**
   * PATCH /notifications/:id/read — Mark a notification as read.
   */
  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const notification = await notificationService.markAsRead(
      req.companyId,
      id
    );
    ApiResponseBuilder.success(res, notification, "Notification marked as read");
  }),

  /**
   * PATCH /notifications/read-all — Mark all notifications as read.
   */
  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationService.markAllAsRead(req.companyId);
    ApiResponseBuilder.success(res, data, "All notifications marked as read");
  }),

  /**
   * DELETE /notifications/:id — Delete a notification.
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await notificationService.deleteNotification(
      req.companyId,
      id
    );
    ApiResponseBuilder.success(res, null, "Notification deleted successfully");
  }),
};
