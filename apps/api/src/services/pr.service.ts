import { prisma } from "../lib/prisma";
import type { CreatePRInput } from "../validators/pr.validator";

export const prService = {
  async createPR(companyId: string, requesterUserId: string, data: CreatePRInput) {
    const prNumber = `PR-${Date.now()}`; // simple auto-gen
    const pr = await prisma.purchaseRequest.create({
      data: {
        companyId,
        prNumber,
        requesterUserId,
        department: data.department,
        requiredByDate: new Date(data.requiredByDate),
        budgetCode: data.budgetCode,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            itemId: item.itemId,
            freeTextDescription: item.freeTextDescription,
            quantity: item.quantity,
            unit: item.unit,
            estimatedRate: item.estimatedRate,
            estimatedTotal: item.estimatedRate ? item.estimatedRate * item.quantity : null,
          }))
        }
      },
      include: { items: true }
    });
    return pr;
  },

  async submitPR(companyId: string, prId: string) {
    return prisma.purchaseRequest.update({
      where: { id: prId, companyId },
      data: { status: "SUBMITTED" }
    });
  },

  async getPRById(companyId: string, prId: string) {
    return prisma.purchaseRequest.findUnique({
      where: { id: prId, companyId },
      include: { items: true, requester: true }
    });
  },

  async listPRs(companyId: string) {
    return prisma.purchaseRequest.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
  }
};
