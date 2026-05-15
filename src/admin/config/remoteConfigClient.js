import apiClient from "@/services/api/apiClient";

class RemoteConfigClient {

  cache = null;

  async load() {

    const response =
      await apiClient.get(
        "/app/config"
      );

    this.cache =
      response.data;

    return this.cache;

  }

  get(key) {

    return this.cache?.[key];

  }

}

const remoteConfigClient =
  new RemoteConfigClient();

export default remoteConfigClient;