import apiClient from "@/infra/api/apiClient";

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
    await apiClient.post(

      "/auth/refresh",

      {

        refreshToken,

      }

    );

  return response.data;

}