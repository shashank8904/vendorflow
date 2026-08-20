import { Router } from "express";
import { auditLogController } from "../controllers/audit-log.controller";
import { validate } from "../middlewares/validate.middleware";
import { auditLogQuerySchema } from "../validators/audit-log.validator";

const router = Router();

router.get(
  "/",
  validate({ query: auditLogQuerySchema }),
  auditLogController.getAll
);

export default router;
