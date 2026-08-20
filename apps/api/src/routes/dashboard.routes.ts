import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/summary", dashboardController.getSummary);
router.get("/activity", dashboardController.getActivity);
router.get("/metrics", dashboardController.getMetrics);

export default router;
