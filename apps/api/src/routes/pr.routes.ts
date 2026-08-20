import { Router } from "express";
import { prController } from "../controllers/pr.controller";

const router = Router();

router.post("/", prController.createPR);
router.post("/:id/submit", prController.submitPR);
router.get("/:id", prController.getPR);
router.get("/", prController.listPRs);

export default router;
