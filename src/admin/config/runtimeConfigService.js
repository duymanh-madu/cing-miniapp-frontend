import apiClient from "@/services/api/apiClient";

class RuntimeConfigService {

  async load() {

    const response =
      await apiClient.get(
        "/app/config"
      );

    return response.data;

  }

  async update(
    payload
  ) {

    const response =
      await apiClient.put(
        "/admin/config",
        payload
      );

    return response.data;

  }

}

const runtimeConfigService =
  new RuntimeConfigService();

export default
  runtimeConfigService;