import type { Request, Response } from "express";
import { prService } from "../services/pr.service";
import { createPRSchema } from "../validators/pr.validator";

export const prController = {
  async createPR(req: Request, res: Response) {
    const data = createPRSchema.parse(req.body);
    // Mock user for MVP since auth is not fully wired
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    const userId = req.headers["x-user-id"] as string || "demo-user";
    
    const pr = await prService.createPR(companyId, userId, data);
    res.status(201).json({ success: true, data: pr });
  },

  async submitPR(req: Request, res: Response) {
    const { id } = req.params;
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    
    const pr = await prService.submitPR(companyId, id);
    res.json({ success: true, data: pr });
  },

  async getPR(req: Request, res: Response) {
    const { id } = req.params;
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    
    const pr = await prService.getPRById(companyId, id);
    res.json({ success: true, data: pr });
  },

  async listPRs(req: Request, res: Response) {
    const companyId = req.headers["x-company-id"] as string || "demo-company";
    const prs = await prService.listPRs(companyId);
    res.json({ success: true, data: prs });
  }
};
