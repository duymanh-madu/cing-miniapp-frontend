import httpClient from "./httpClient";

export async function httpGet(
  url,
  config = {}
) {

  const response =
    await httpClient.get(
      url,
      config
    );

  return response.data;

}