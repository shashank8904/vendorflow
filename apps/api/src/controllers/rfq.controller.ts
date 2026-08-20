import type { Request, Response } from "express";
import { rfqService } from "../services/rfq.service";
import { createRFQSchema } from "../validators/rfq.validator";

export const rfqController = {
  async createRFQ(req: Request, res: Response) {
    const data = createRFQSchema.parse(req.body);
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    
    const rfq = await rfqService.createRFQ(companyId, data);
    res.status(201).json({ success: true, data: rfq });
  },

  async collectQuotes(req: Request, res: Response) {
    const { id } = req.params;
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    
    const result = await rfqService.collectQuotesFromVoice(companyId, id);
    res.json(result);
  },

  async webhookVoice(req: Request, res: Response) {
    await rfqService.webhookVoiceResult(req.body);
    res.json({ success: true });
  }
};
