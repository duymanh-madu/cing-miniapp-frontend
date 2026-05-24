import {
  restoreSession,
} from "./authSession";

import useAuthStore from "@/stores/auth/authStore";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

export function bootstrapAuth() {

  const authenticated =
    restoreSession();

  if (!authenticated) {
    useAuthStore
      .getState()
      .clearSession();
  }

  runtimeLogger.info(
    "AUTH",
    "[BOOTSTRAP] Auth ready"
  );

}
