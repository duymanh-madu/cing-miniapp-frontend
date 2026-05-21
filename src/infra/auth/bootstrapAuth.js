import {
  getAccessToken,
  getRefreshToken,
} from "./authStorage";

import useAuthStore from "@/stores/authStore";

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

  console.log(
    "🟢 AUTH RESTORED"
  );

}