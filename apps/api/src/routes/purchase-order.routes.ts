import { Router } from "express";
import { purchaseOrderController } from "../controllers/purchase-order.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  updatePOStatusSchema,
  purchaseOrderQuerySchema,
  poIdParamSchema,
} from "../validators/purchase-order.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createPurchaseOrderSchema }),
  purchaseOrderController.create
);

router.get(
  "/",
  validate({ query: purchaseOrderQuerySchema }),
  purchaseOrderController.getAll
);

router.get(
  "/:id",
  validate({ params: poIdParamSchema }),
  purchaseOrderController.getById
);

router.patch(
  "/:id",
  validate({ params: poIdParamSchema, body: updatePurchaseOrderSchema }),
  purchaseOrderController.update
);

router.patch(
  "/:id/status",
  validate({ params: poIdParamSchema, body: updatePOStatusSchema }),
  purchaseOrderController.updateStatus
);

router.delete(
  "/:id",
  validate({ params: poIdParamSchema }),
  purchaseOrderController.delete
);

export default router;
