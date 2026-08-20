import { prisma } from "../lib/prisma";
import axios from "axios";

export const tallyService = {
  async importVendors(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const config = company?.tallyConfig as any;
    
    if (!config || !config.connectorUrl) {
      throw new Error("Tally connector URL not configured");
    }

    // Call local tally connector
    const response = await axios.get(`${config.connectorUrl}/masters/vendors`, {
      headers: { "Authorization": `Bearer ${config.token}` }
    });

    const vendors = response.data;
    let imported = 0;

    for (const v of vendors) {
      await prisma.vendor.create({
        data: {
          companyId,
          name: v.LEDGERNAME,
          phone: v.PHONE || "",
          tallyLedgerId: v.LEDGERID,
          tallySyncStatus: "SYNCED"
        }
      });
      imported++;
    }

    return { success: true, message: `Imported ${imported} vendors` };
  },

  async syncPO(companyId: string, poId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId, companyId },
      include: { items: true, vendor: true }
    });
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const config = company?.tallyConfig as any;

    if (!po || !config || !config.connectorUrl) {
      throw new Error("Invalid PO or missing Tally config");
    }

    const payload = {
      poNumber: po.poNumber,
      date: po.createdAt.toISOString().split("T")[0].replace(/-/g, ""),
      vendorLedgerName: po.vendor.name,
      totalAmount: po.grandTotal,
      items: po.items.map(item => ({
        name: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.lineTotal
      }))
    };

    try {
      const response = await axios.post(`${config.connectorUrl}/po/create`, payload, {
        headers: { "Authorization": `Bearer ${config.token}` }
      });

      await prisma.purchaseOrder.update({
        where: { id: poId },
        data: { tallySyncStatus: "SYNCED" }
      });

      return { success: true, message: "PO synced to Tally" };
    } catch (error: any) {
      await prisma.purchaseOrder.update({
        where: { id: poId },
        data: { tallySyncStatus: "FAILED", tallyLastError: error.message }
      });
      throw new Error(`Tally sync failed: ${error.message}`);
    }
  }
};
