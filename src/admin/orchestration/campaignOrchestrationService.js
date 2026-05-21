import apiClient from "@/infra/api/apiClient";

class CampaignOrchestrationService {

  async getWorkflows() {

    const response =
      await apiClient.get(
        "/admin/campaign-workflows"
      );

    return response.data;

  }

  async executeWorkflow(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/campaign-workflows/execute",
        payload
      );

    return response.data;

  }

}

const campaignOrchestrationService =
  new CampaignOrchestrationService();

export default
  campaignOrchestrationService;