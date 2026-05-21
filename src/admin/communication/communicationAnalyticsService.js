import apiClient from "@/infra/api/apiClient";

class CommunicationAnalyticsService {

  async getMetrics() {

    const response =
      await apiClient.get(
        "/admin/communication/metrics"
      );

    return response.data;

  }

  async getEngagementTimeline() {

    const response =
      await apiClient.get(
        "/admin/communication/timeline"
      );

    return response.data;

  }

}

const communicationAnalyticsService =
  new CommunicationAnalyticsService();

export default
  communicationAnalyticsService;