import httpClient
  from "../http/httpClient";

/**
 * =========================================================
 * FETCH RUNTIME CONFIG
 * =========================================================
 */

export async function
fetchRuntimeConfig() {

  const response =

    await httpClient.get(
      "/app/config"
    );

  return response;

}