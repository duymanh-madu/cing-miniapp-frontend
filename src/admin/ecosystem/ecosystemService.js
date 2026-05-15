import apiClient from "@/services/api/apiClient";

class EcosystemService {

  async getEcosystemApps() {

    const response =
      await apiClient.get(
        "/admin/ecosystem/apps"
      );

    return response.data;

  }

  async getFederationRuntime() {

    const response =
      await apiClient.get(
        "/admin/ecosystem/federation"
      );

    return response.data;

  }

  async getEcosystemMetrics() {

    const response =
      await apiClient.get(
        "/admin/ecosystem/metrics"
      );

    return response.data;

  }

}

const ecosystemService =
  new EcosystemService();

export default
  ecosystemService;