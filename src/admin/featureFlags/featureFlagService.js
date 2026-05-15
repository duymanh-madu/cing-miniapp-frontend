import apiClient from "@/services/api/apiClient";

class FeatureFlagService {

  async load() {

    const response =
      await apiClient.get(
        "/app/feature-flags"
      );

    return response.data;

  }

  async update(
    payload
  ) {

    const response =
      await apiClient.put(
        "/admin/feature-flags",
        payload
      );

    return response.data;

  }

}

const featureFlagService =
  new FeatureFlagService();

export default
  featureFlagService;