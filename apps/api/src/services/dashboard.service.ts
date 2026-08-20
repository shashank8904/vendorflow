import { dashboardRepository } from "../repositories/dashboard.repository";

/**
 * Dashboard business logic.
 * Composes data from the repository into dashboard-ready structures.
 */
class DashboardService {
  /**
   * Get the dashboard summary: card counts.
   */
  async getSummary(companyId: string) {
    return dashboardRepository.getSummaryCounts(companyId);
  }

  /**
   * Get recent activity: latest vendors and POs.
   */
  async getActivity(companyId: string) {
    return dashboardRepository.getRecentActivity(companyId, 10);
  }

  /**
   * Get dashboard metrics: aggregates and call stats.
   */
  async getMetrics(companyId: string) {
    return dashboardRepository.getMetrics(companyId);
  }
}

export const dashboardService = new DashboardService();
