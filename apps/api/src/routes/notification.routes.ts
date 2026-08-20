import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createNotificationSchema,
  notificationQuerySchema,
  notificationIdParamSchema,
} from "../validators/notification.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createNotificationSchema }),
  notificationController.create
);

router.get(
  "/",
  validate({ query: notificationQuerySchema }),
  notificationController.getAll
);

// Static routes BEFORE parameterized routes
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);

router.patch(
  "/:id/read",
  validate({ params: notificationIdParamSchema }),
  notificationController.markAsRead
);

router.delete(
  "/:id",
  validate({ params: notificationIdParamSchema }),
  notificationController.delete
);

export default router;
