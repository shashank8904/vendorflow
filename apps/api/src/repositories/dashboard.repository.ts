import prisma from "../lib/prisma";

/**
 * Dashboard data access layer.
 * Aggregate queries for dashboard summary, activity, and metrics.
 */
export class DashboardRepository {
  /**
   * Get counts for the dashboard summary cards.
   */
  async getSummaryCounts(companyId: string) {
    const [
      vendorCount,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      delayedOrders,
      cancelledOrders,
      activeVendors,
      inactiveVendors,
    ] = await Promise.all([
      prisma.vendor.count({ where: { companyId, deletedAt: null } }),
      prisma.purchaseOrder.count({ where: { companyId, deletedAt: null } }),
      prisma.purchaseOrder.count({
        where: { companyId, deletedAt: null, status: "PENDING" },
      }),
      prisma.purchaseOrder.count({
        where: { companyId, deletedAt: null, status: "CONFIRMED" },
      }),
      prisma.purchaseOrder.count({
        where: { companyId, deletedAt: null, status: "DELAYED" },
      }),
      prisma.purchaseOrder.count({
        where: { companyId, deletedAt: null, status: "CANCELLED" },
      }),
      prisma.vendor.count({
        where: { companyId, deletedAt: null, status: "ACTIVE" },
      }),
      prisma.vendor.count({
        where: { companyId, deletedAt: null, status: "INACTIVE" },
      }),
    ]);

    return {
      vendorCount,
      activeVendors,
      inactiveVendors,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      delayedOrders,
      cancelledOrders,
    };
  }

  /**
   * Get recent activity (latest vendors and POs created/updated).
   */
  async getRecentActivity(companyId: string, limit = 10) {
    const [recentVendors, recentOrders] = await Promise.all([
      prisma.vendor.findMany({
        where: { companyId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          contactPerson: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.purchaseOrder.findMany({
        where: { companyId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          poNumber: true,
          amount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vendor: { select: { id: true, name: true } },
        },
      }),
    ]);

    return { recentVendors, recentOrders };
  }

  /**
   * Get aggregate metrics: total order value, average order value.
   */
  async getMetrics(companyId: string) {
    const orderAggregates = await prisma.purchaseOrder.aggregate({
      where: { companyId, deletedAt: null },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: { id: true },
    });

    const callCounts = await prisma.call.groupBy({
      by: ["status"],
      where: {
        purchaseOrder: { companyId, deletedAt: null },
      },
      _count: { id: true },
    });

    return {
      totalOrderValue: orderAggregates._sum.amount || 0,
      averageOrderValue: orderAggregates._avg.amount || 0,
      totalOrders: orderAggregates._count.id,
      callsByStatus: callCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}

export const dashboardRepository = new DashboardRepository();
