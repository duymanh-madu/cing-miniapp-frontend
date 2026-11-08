import {advanceAuthSessionEpochV42} from "./authSessionEpochV42.js";
import {
  clearAuthStorage,
} from "./authStorage";

import useAuthStore from
  "@/stores/auth/authStore";

import sessionHydrator from
  "@/core/session/sessionHydrator";

export function
clearStaleBackendAuthSession() {
  advanceAuthSessionEpochV42();
  clearAuthStorage();

  try {
    sessionHydrator.clear();
  } catch {}

  useAuthStore
    .getState()
    .clearSession();
}
