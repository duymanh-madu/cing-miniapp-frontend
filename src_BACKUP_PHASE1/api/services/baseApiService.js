import httpClient from "../client/httpClient";

import {
  retryRequest,
} from "../retry/requestRetryEngine";

import {
  API_CONFIG,
} from "../config/apiConfig";

export async function apiGet({

  url,

}) {

  return retryRequest({

    retries:
      API_CONFIG.MAX_RETRIES,

    delay:
      API_CONFIG.RETRY_DELAY_MS,

    request:
      async () => {

        const response =
          await httpClient.get(
            url
          );

        return response.data;

      },

  });

}