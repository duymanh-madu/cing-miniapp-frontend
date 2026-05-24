import apiClient from "@/infra/api/apiClient";

class FranchiseService {

  async getFranchises() {

    const response =
      await apiClient.get(
        "/admin/franchise"
      );

    return response.data;

  }

  async getBranchMetrics() {

    const response =
      await apiClient.get(
        "/admin/franchise/metrics"
      );

    return response.data;

  }

  async getFranchiseAnalytics() {

    const response =
      await apiClient.get(
        "/admin/franchise/analytics"
      );

    return response.data;

  }

}

const franchiseService =
  new FranchiseService();

export default
  franchiseService;