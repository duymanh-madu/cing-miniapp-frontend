import axios from "axios";

const API_BASE_URL =
  import.meta.env
    .VITE_API_BASE_URL;

class RemoteConfigApi {

  async fetch() {

    try {

      const response =
        await axios.get(

          `${API_BASE_URL}/cms/remote-config`

        );

      return response.data;

    } catch (error) {

      console.error(
        "fetch remote config failed",
        error
      );

      return {};

    }

  }

}

const remoteConfigApi =
  new RemoteConfigApi();

export default
  remoteConfigApi;