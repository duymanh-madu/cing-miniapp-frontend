import apiClient from "../../../infra/api/apiClient";

class AdminAnalyticsEngine {

  async getDashboard() {

    const response =
      await apiClient.get(
        "/admin/analytics/dashboard"
      );

    return response.data;

  }

}

const adminAnalyticsEngine =
  new AdminAnalyticsEngine();

export default
  adminAnalyticsEngine;