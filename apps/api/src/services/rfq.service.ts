import { prisma } from "../lib/prisma";
import type { CreateRFQInput } from "../validators/rfq.validator";

export const rfqService = {
  async createRFQ(companyId: string, data: CreateRFQInput) {
    const rfq = await prisma.rFQ.create({
      data: {
        companyId,
        prId: data.prId,
        selectedVendorIds: data.vendorIds,
        status: "DRAFT"
      }
    });
    return rfq;
  },

  async collectQuotesFromVoice(companyId: string, rfqId: string) {
    const rfq = await prisma.rFQ.update({
      where: { id: rfqId, companyId },
      data: { status: "SENT" },
      include: { pr: { include: { items: true } } }
    });

    // Dummy logic: Simulate triggering a voice call agent
    for (const vendorId of rfq.selectedVendorIds) {
      await prisma.call.create({
        data: {
          companyId,
          relatedEntityType: "RFQ",
          relatedEntityId: rfq.id,
          vendorId,
          intent: "RFQ_QUOTE",
          status: "PENDING"
        }
      });
    }

    return { success: true, message: `Triggered voice calls for ${rfq.selectedVendorIds.length} vendors` };
  },

  async webhookVoiceResult(payload: any) {
    // Process incoming webhook from CPaaS
    const { callId, transcript, extractedData } = payload;
    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "COMPLETED",
        transcript,
        structuredData: extractedData
      }
    });

    if (call.relatedEntityType === "RFQ" && call.vendorId) {
      await prisma.quotation.create({
        data: {
          rfqId: call.relatedEntityId!,
          vendorId: call.vendorId,
          price: extractedData.price,
          leadTimeDays: extractedData.leadTimeDays,
          status: "SUBMITTED"
        }
      });
    }
  }
};
