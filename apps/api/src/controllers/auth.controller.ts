import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";

export const authController = {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json({ success: true, data: result });
  },

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.json({ success: true, data: result });
  }
};
