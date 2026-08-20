import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";

const router = Router();

router.get("/monthly-orders", analyticsController.getMonthlyOrders);
router.get("/vendor-performance", analyticsController.getVendorPerformance);
router.get("/delay-analysis", analyticsController.getDelayAnalysis);
router.get("/status-distribution", analyticsController.getStatusDistribution);
router.get("/call-statistics", analyticsController.getCallStatistics);

export default router;
