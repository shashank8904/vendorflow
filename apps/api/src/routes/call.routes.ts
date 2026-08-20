import { Router } from "express";
import { callController } from "../controllers/call.controller";
import { validate } from "../middlewares/validate.middleware";
import { callQuerySchema, callIdParamSchema } from "../validators/call.validator";

const router = Router();

router.get(
  "/",
  validate({ query: callQuerySchema }),
  callController.getAll
);

router.get(
  "/:id",
  validate({ params: callIdParamSchema }),
  callController.getById
);

export default router;
