import apiClient from "@/infra/api/apiClient";

class CampaignService {

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

  async updateCampaign({

    campaignId,

    payload,

  }) {

    const response =
      await apiClient.put(

        `/admin/campaigns/${campaignId}`,

        payload

      );

    return response.data;

  }

  async triggerCampaign({

    campaignId,

  }) {

    const response =
      await apiClient.post(

        `/admin/campaigns/${campaignId}/trigger`

      );

    return response.data;

  }

}

const campaignService =
  new CampaignService();

export default
  campaignService;