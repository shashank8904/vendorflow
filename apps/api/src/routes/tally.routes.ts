import { Router } from "express";
import { tallyController } from "../controllers/tally.controller";

const router = Router();

router.post("/import-vendors", tallyController.importVendors);
router.post("/po/:id/sync", tallyController.syncPO);

export default router;
