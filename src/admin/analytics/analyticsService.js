import apiClient from "@/infra/api/apiClient";

class AnalyticsService {

  async getDashboardMetrics() {

    const response =
      await apiClient.get(
        "/admin/analytics/dashboard"
      );

    return response.data;

  }

  async getRealtimeFeed() {

    const response =
      await apiClient.get(
        "/admin/analytics/feed"
      );

    return response.data;

  }

}

const analyticsService =
  new AnalyticsService();

export default
  analyticsService;