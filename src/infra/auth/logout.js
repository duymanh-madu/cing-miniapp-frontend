import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  destroySession,
} from "./authSession";

import apiClient from "@/infra/api/apiClient";

import {
  getCanonicalAccessToken,
} from "./persistedAuthSession";

import {
  clearLocalDeviceReauthCredential,
} from "./localDeviceReauth";

import {
  resetQueryCache,
} from "@/query";

export function logout() {

  const accessToken =
    String(
      getCanonicalAccessToken() ||
      ""
    ).trim();

  /*
   * Start remote revocation and durable-device clearing
   * before local JWT destruction.
   *
   * Neither remote failure may prevent the user's
   * local logout from completing.
   */
  if (accessToken) {
    void apiClient.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    ).catch(() => {});
  }

  void clearLocalDeviceReauthCredential()
    .catch(() => false);

  destroySession();

  resetQueryCache();

  runtimeLogger.info(
    "AUTH",
    "🔴 LOGGED OUT"
  );

}