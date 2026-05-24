import {
  setAccessToken,
  setRefreshToken,
  clearAuthStorage,
} from "./authStorage";

import useAuthStore from "@/stores/auth";

export function createSession({
  accessToken,
  refreshToken,
  profile,
}) {

  setAccessToken(
    accessToken
  );

  setRefreshToken(
    refreshToken
  );

  useAuthStore
    .getState()
    .setSession({

      accessToken,

      refreshToken,

      profile,

    });

}

export function destroySession() {

  clearAuthStorage();

  useAuthStore
    .getState()
    .clearSession();

}