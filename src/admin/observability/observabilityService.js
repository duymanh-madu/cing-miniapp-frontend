import apiClient from "@/services/api/apiClient";

class ObservabilityService {

  async getSystemHealth() {

    const response =
      await apiClient.get(
        "/admin/observability/health"
      );

    return response.data;

  }

  async getInfrastructureMetrics() {

    const response =
      await apiClient.get(
        "/admin/observability/infrastructure"
      );

    return response.data;

  }

  async getQueueMetrics() {

    const response =
      await apiClient.get(
        "/admin/observability/queues"
      );

    return response.data;

  }

  async getWebsocketMetrics() {

    const response =
      await apiClient.get(
        "/admin/observability/websockets"
      );

    return response.data;

  }

  async getActiveIncidents() {

    const response =
      await apiClient.get(
        "/admin/incidents"
      );

    return response.data;

  }

}

const observabilityService =
  new ObservabilityService();

export default
  observabilityService;