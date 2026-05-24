import apiClient from "@/infra/api/apiClient";

class IposService {

  async getConnectionStatus() {

    const response =
      await apiClient.get(
        "/admin/ipos/status"
      );

    return response.data;

  }

  async getSyncMetrics() {

    const response =
      await apiClient.get(
        "/admin/ipos/metrics"
      );

    return response.data;

  }

}

const iposService =
  new IposService();

export default
  iposService;