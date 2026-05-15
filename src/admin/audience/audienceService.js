import apiClient from "@/services/api/apiClient";

class AudienceService {

  async getAudiences() {

    const response =
      await apiClient.get(
        "/admin/audiences"
      );

    return response.data;

  }

  async createAudience(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/audiences",
        payload
      );

    return response.data;

  }

}

const audienceService =
  new AudienceService();

export default
  audienceService;