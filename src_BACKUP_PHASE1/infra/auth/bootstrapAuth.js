import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  getAccessToken,
  getRefreshToken,
} from "./authStorage";

import useAuthStore from "@/stores/auth";

export function bootstrapAuth() {

  const accessToken =
    getAccessToken();

  const refreshToken =
    getRefreshToken();

  if (
    !accessToken ||
    !refreshToken
  ) {

    return;

  }

  useAuthStore
    .getState()
    .setSession({

      accessToken,

      refreshToken,

      profile:
        null,

    });

  runtimeLogger.info("AUTH", 
    "🟢 AUTH RESTORED"
  );

}