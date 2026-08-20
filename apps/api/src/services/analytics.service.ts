import { analyticsRepository } from "../repositories/analytics.repository";

/**
 * Analytics business logic.
 */
class AnalyticsService {
  async getMonthlyOrders(companyId: string) {
    return analyticsRepository.getMonthlyOrders(companyId);
  }

  async getVendorPerformance(companyId: string) {
    return analyticsRepository.getVendorPerformance(companyId);
  }

  async getDelayAnalysis(companyId: string) {
    return analyticsRepository.getDelayAnalysis(companyId);
  }

  async getStatusDistribution(companyId: string) {
    return analyticsRepository.getStatusDistribution(companyId);
  }

  async getCallStatistics(companyId: string) {
    return analyticsRepository.getCallStatistics(companyId);
  }
}

export const analyticsService = new AnalyticsService();
