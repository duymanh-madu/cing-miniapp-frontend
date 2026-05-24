import {
  getAccessToken,
} from "../storage/tokenStorage";

import {
  useAuthStore,
} from "../stores/auth";

export function restoreSession() {

  const token =
    getAccessToken();

  if (!token) {

    return false;

  }

  useAuthStore
    .getState()
    .setAuthenticated(
      true
    );

  return true;

}