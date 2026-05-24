import httpClient from "./httpClient";

export async function httpDelete(
  url,
  config = {}
) {

  const response =
    await httpClient.delete(
      url,
      config
    );

  return response.data;

}