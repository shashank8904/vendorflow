import { Router } from "express";
import { rfqController } from "../controllers/rfq.controller";

const router = Router();

router.post("/", rfqController.createRFQ);
router.post("/:id/collect-quotes", rfqController.collectQuotes);
router.post("/webhook/voice", rfqController.webhookVoice);

export default router;
