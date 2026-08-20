import { Router } from "express";
import { vendorController } from "../controllers/vendor.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createVendorSchema,
  updateVendorSchema,
  vendorQuerySchema,
  vendorIdParamSchema,
} from "../validators/vendor.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createVendorSchema }),
  vendorController.create
);

router.get(
  "/",
  validate({ query: vendorQuerySchema }),
  vendorController.getAll
);

router.get(
  "/:id",
  validate({ params: vendorIdParamSchema }),
  vendorController.getById
);

router.patch(
  "/:id",
  validate({ params: vendorIdParamSchema, body: updateVendorSchema }),
  vendorController.update
);

router.delete(
  "/:id",
  validate({ params: vendorIdParamSchema }),
  vendorController.delete
);

export default router;