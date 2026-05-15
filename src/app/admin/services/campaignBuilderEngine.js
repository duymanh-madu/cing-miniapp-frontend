import apiClient from "../../../services/api/apiClient";

class CampaignBuilderEngine {

  async getCampaigns() {

    const response =
      await apiClient.get(
        "/admin/campaigns"
      );

    return response.data;

  }

  async createCampaign(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/campaigns",
        payload
      );

    return response.data;

  }

  async updateCampaign(
    campaignId,
    payload
  ) {

    const response =
      await apiClient.put(
        `/admin/campaigns/${campaignId}`,
        payload
      );

    return response.data;

  }

}

const campaignBuilderEngine =
  new CampaignBuilderEngine();

export default
  campaignBuilderEngine;