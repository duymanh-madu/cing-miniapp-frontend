import {
  getAccessToken,
} from "../storage/tokenStorage";

import useAuthStore from "@/stores/auth/authStore";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * AUTH SESSION RESTORE
 * =====================================================
 * Single auth store owner:
 *   src/stores/auth/authStore.js
 * =====================================================
 */

export function restoreSession() {

  const token =
    getAccessToken();

  if (!token) {

    runtimeLogger.info(
      "AUTH",
      "[SESSION] No persisted token"
    );

    return false;

  }

  useAuthStore
    .getState()
    .setSession({

      accessToken:
        token,

      refreshToken:
        null,

      profile:
        null,

    });

  runtimeLogger.info(
    "AUTH",
    "[SESSION] Restored"
  );

  return true;

}
