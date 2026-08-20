import prisma from "../lib/prisma";
import type { PurchaseOrderStatus } from "@prisma/client";

/**
 * Analytics data access layer.
 * Aggregate and groupBy queries for business intelligence views.
 */
export class AnalyticsRepository {
  /**
   * Get monthly order counts for the last 12 months.
   */
  async getMonthlyOrders(companyId: string) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const orders = await prisma.purchaseOrder.findMany({
      where: {
        companyId,
        deletedAt: null,
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        createdAt: true,
        amount: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by month
    const monthlyData = new Map<string, { count: number; totalAmount: number }>();

    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${(order.createdAt.getMonth() + 1).toString().padStart(2, "0")}`;
      const existing = monthlyData.get(key) || { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += order.amount;
      monthlyData.set(key, existing);
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  /**
   * Get vendor performance: order count, total value, and status distribution per vendor.
   */
  async getVendorPerformance(companyId: string) {
    const vendors = await prisma.vendor.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        purchaseOrders: {
          where: { deletedAt: null },
          select: {
            amount: true,
            status: true,
          },
        },
        _count: {
          select: {
            purchaseOrders: true,
            calls: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return vendors.map((vendor) => {
      const totalValue = vendor.purchaseOrders.reduce(
        (sum, po) => sum + po.amount,
        0
      );

      const statusCounts = vendor.purchaseOrders.reduce(
        (acc, po) => {
          acc[po.status] = (acc[po.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        id: vendor.id,
        name: vendor.name,
        status: vendor.status,
        totalOrders: vendor._count.purchaseOrders,
        totalCalls: vendor._count.calls,
        totalValue,
        statusDistribution: statusCounts,
      };
    });
  }

  /**
   * Get average delay analysis: POs marked as DELAYED.
   */
  async getDelayAnalysis(companyId: string) {
    const delayedOrders = await prisma.purchaseOrder.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: "DELAYED",
        expectedDelivery: { not: null },
      },
      select: {
        id: true,
        poNumber: true,
        expectedDelivery: true,
        updatedAt: true,
        vendor: { select: { id: true, name: true } },
      },
    });

    const now = new Date();
    let totalDelayDays = 0;

    const delayDetails = delayedOrders.map((order) => {
      const delayDays = order.expectedDelivery
        ? Math.max(
            0,
            Math.floor(
              (now.getTime() - order.expectedDelivery.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 0;
      totalDelayDays += delayDays;

      return {
        id: order.id,
        poNumber: order.poNumber,
        vendor: order.vendor,
        expectedDelivery: order.expectedDelivery,
        delayDays,
      };
    });

    return {
      totalDelayed: delayedOrders.length,
      averageDelayDays:
        delayedOrders.length > 0
          ? Math.round(totalDelayDays / delayedOrders.length)
          : 0,
      delays: delayDetails,
    };
  }

  /**
   * Get order status distribution.
   */
  async getStatusDistribution(companyId: string) {
    const groups = await prisma.purchaseOrder.groupBy({
      by: ["status"],
      where: { companyId, deletedAt: null },
      _count: { id: true },
      _sum: { amount: true },
    });

    return groups.map((group) => ({
      status: group.status,
      count: group._count.id,
      totalAmount: group._sum.amount || 0,
    }));
  }

  /**
   * Get call statistics (placeholder — real data when CALL-E is integrated).
   */
  async getCallStatistics(companyId: string) {
    const groups = await prisma.call.groupBy({
      by: ["status"],
      where: {
        purchaseOrder: { companyId, deletedAt: null },
      },
      _count: { id: true },
    });

    const totalCalls = groups.reduce((sum, g) => sum + g._count.id, 0);

    return {
      totalCalls,
      byStatus: groups.reduce(
        (acc, g) => {
          acc[g.status] = g._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      // Placeholder metrics for CALL-E integration
      averageDuration: null,
      successRate: null,
      note: "Call statistics will be fully populated when CALL-E is integrated",
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
