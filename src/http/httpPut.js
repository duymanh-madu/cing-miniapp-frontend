import httpClient from "./httpClient";

export async function httpPut(
  url,
  payload = {},
  config = {}
) {

  const response =
    await httpClient.put(

      url,

      payload,

      config

    );

  return response.data;

}