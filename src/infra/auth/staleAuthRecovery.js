import {
  clearAuthStorage,
} from "./authStorage";

import useAuthStore from
  "@/stores/auth/authStore";

import sessionHydrator from
  "@/core/session/sessionHydrator";

export function
clearStaleBackendAuthSession() {
  clearAuthStorage();

  try {
    sessionHydrator.clear();
  } catch {}

  useAuthStore
    .getState()
    .clearSession();
}
