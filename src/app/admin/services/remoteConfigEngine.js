import apiClient from "../../../services/api/apiClient";

class RemoteConfigEngine {

  cache = null;

  async load() {

    const response =
      await apiClient.get(
        "/admin/config"
      );

    this.cache =
      response.data;

    return this.cache;

  }

  async update(payload) {

    const response =
      await apiClient.put(
        "/admin/config",
        payload
      );

    this.cache =
      response.data;

    return this.cache;

  }

  get() {

    return this.cache;

  }

}

const remoteConfigEngine =
  new RemoteConfigEngine();

export default
  remoteConfigEngine;