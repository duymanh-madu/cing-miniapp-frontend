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

  const session = {
    accessToken,
    refreshToken,
    profile,
  };

  try {
    sessionHydrator.persist(session);
    const phone = String(profile?.phone || "").replace(/\D/g, "").replace(/^84/, "0");
    if (phone && phone !== "pending" && phone.length >= 9) {
      localStorage.setItem("__user_phone", phone);
    }
  } catch {}

  useAuthStore
    .getState()
    .setSession(session);

}

export function destroySession() {

  clearAuthStorage();

  sessionHydrator
    .clear();

  useAuthStore
    .getState()
    .clearSession();

}