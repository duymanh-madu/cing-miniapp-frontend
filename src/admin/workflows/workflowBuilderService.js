import apiClient from "@/infra/api/apiClient";

class WorkflowBuilderService {

  async getWorkflowGraph(
    workflowId
  ) {

    const response =
      await apiClient.get(

        `/admin/workflows/${workflowId}/graph`

      );

    return response.data;

  }

  async saveWorkflowGraph(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/workflows/graph",
        payload
      );

    return response.data;

  }

}

const workflowBuilderService =
  new WorkflowBuilderService();

export default
  workflowBuilderService;