import {
  setAccessToken,
  setRefreshToken,
  clearAuthStorage,
} from "./authStorage";

import useAuthStore from "@/stores/auth";

import sessionHydrator from "@/core/session/sessionHydrator";

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

  sessionHydrator
    .clear();

  useAuthStore
    .getState()
    .clearSession();

}