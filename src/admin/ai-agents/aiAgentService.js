import apiClient from "@/services/api/apiClient";

class AiAgentService {

  async getAgents() {

    const response =
      await apiClient.get(
        "/admin/ai-agents"
      );

    return response.data;

  }

  async getActiveAgents() {

    const response =
      await apiClient.get(
        "/admin/ai-agents/active"
      );

    return response.data;

  }

  async triggerAutonomousAction(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/ai-agents/actions",
        payload
      );

    return response.data;

  }

}

const aiAgentService =
  new AiAgentService();

export default
  aiAgentService;