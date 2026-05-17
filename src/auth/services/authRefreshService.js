import httpClient from "@/api/client/httpClient";

import {
  getRefreshToken,
} from "../storage/refreshTokenStorage";

export async function refreshSession() {

  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {

    return null;

  }

  const response =
    await httpClient.post(

      "/auth/refresh",

      {

        refreshToken,

      }

    );

  return response.data;

}