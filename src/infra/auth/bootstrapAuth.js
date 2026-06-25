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

  let persisted = null;
  try {
    persisted = JSON.parse(localStorage.getItem("cing_session") || "null");
  } catch {}

  const profile = persisted?.profile || null;

  useAuthStore
    .getState()
    .setSession({

      accessToken,

      refreshToken,

      profile,

    });

  try {
    const phone = String(profile?.phone || localStorage.getItem("__user_phone") || "")
      .replace(/\D/g, "")
      .replace(/^84/, "0");
    if (phone && phone !== "pending" && phone.length >= 9) {
      localStorage.setItem("__user_phone", phone);
    }
  } catch {}

  runtimeLogger.info("AUTH", 
    "🟢 AUTH RESTORED"
  );

}