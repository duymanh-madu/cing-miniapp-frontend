import apiClient from "@/services/api/apiClient";

class AutomationService {

  async getWorkflows() {

    const response =
      await apiClient.get(
        "/admin/automation/workflows"
      );

    return response.data;

  }

  async createWorkflow(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/automation/workflows",
        payload
      );

    return response.data;

  }

  async executeWorkflow(
    workflowId
  ) {

    const response =
      await apiClient.post(

        `/admin/automation/workflows/${workflowId}/execute`

      );

    return response.data;

  }

  async getMetrics() {

    const response =
      await apiClient.get(
        "/admin/automation/metrics"
      );

    return response.data;

  }

}

const automationService =
  new AutomationService();

export default
  automationService;