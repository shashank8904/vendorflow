import type { Request, Response } from "express";
import { tallyService } from "../services/tally.service";

export const tallyController = {
  async importVendors(req: Request, res: Response) {
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    try {
      const result = await tallyService.importVendors(companyId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async syncPO(req: Request, res: Response) {
    const { id } = req.params;
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    try {
      const result = await tallyService.syncPO(companyId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
