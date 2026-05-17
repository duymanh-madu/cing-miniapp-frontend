import {
  getAccessToken,
} from "../storage/tokenStorage";

import {
  useAuthStore,
} from "../store/authStore";

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