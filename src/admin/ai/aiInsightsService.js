import apiClient from "@/services/api/apiClient";

class AiInsightsService {

  async getRecommendations() {

    const response =
      await apiClient.get(
        "/admin/ai/recommendations"
      );

    return response.data;

  }

  async getInsights() {

    const response =
      await apiClient.get(
        "/admin/ai/insights"
      );

    return response.data;

  }

  async getPredictions() {

    const response =
      await apiClient.get(
        "/admin/ai/predictions"
      );

    return response.data;

  }

}

const aiInsightsService =
  new AiInsightsService();

export default
  aiInsightsService;