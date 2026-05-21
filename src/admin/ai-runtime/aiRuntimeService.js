import apiClient from "@/infra/api/apiClient";

class AiRuntimeService {

  async getRuntimeModels() {

    const response =
      await apiClient.get(
        "/admin/ai-runtime/models"
      );

    return response.data;

  }

  async getRuntimeMetrics() {

    const response =
      await apiClient.get(
        "/admin/ai-runtime/metrics"
      );

    return response.data;

  }

}

const aiRuntimeService =
  new AiRuntimeService();

export default
  aiRuntimeService;