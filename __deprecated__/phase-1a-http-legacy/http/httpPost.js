import httpClient from "./httpClient";

export async function httpPost(
  url,
  payload = {},
  config = {}
) {

  const response =
    await httpClient.post(

      url,

      payload,

      config

    );

  return response.data;

}