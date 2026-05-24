import apiClient from "@/infra/api/apiClient";

class EngagementService {

  async getScores() {

    const response =
      await apiClient.get(
        "/admin/engagement/scores"
      );

    return response.data;

  }

  async getJourneys() {

    const response =
      await apiClient.get(
        "/admin/engagement/journeys"
      );

    return response.data;

  }

}

const engagementService =
  new EngagementService();

export default
  engagementService;