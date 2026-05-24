import apiClient from "@/infra/api/apiClient";

class ReleaseService {

  async getReleases() {

    const response =
      await apiClient.get(
        "/admin/releases"
      );

    return response.data;

  }

  async getEnvironmentStatus() {

    const response =
      await apiClient.get(
        "/admin/releases/environments"
      );

    return response.data;

  }

}

const releaseService =
  new ReleaseService();

export default
  releaseService;