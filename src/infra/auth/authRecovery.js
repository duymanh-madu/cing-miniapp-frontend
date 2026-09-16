import apiClient from "../api/apiClient.js";
import { createSession } from "./authSession.js";
import { getPersistedAuthSession } from "./persistedAuthSession.js";

let refreshInFlight = null;

function statusOf(error) {
  return Number(error?.response?.status || 0);
}

function isDefinitiveRefreshRejection(error) {
  const status = statusOf(error);
  return status === 400 || status === 401 || status === 403;
}

/**
 * Recover an authenticated backend session after a protected request
 * receives HTTP 401.
 *
 * Authority rules:
 * - exactly one refresh operation may run at a time;
 * - refresh token is preserved because backend /auth/refresh does not rotate it;
 * - createSession() is the canonical persistence authority so
 *   cing_access_token, cing_session and the auth store cannot diverge;
 * - transient refresh failures are surfaced, never converted into logout;
 * - callers decide whether their original operation is safe to retry.
 */
export async function recoverBackendAuthSession() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const persisted = getPersistedAuthSession();
    const refreshToken = String(persisted?.refreshToken || "").trim();

    if (!refreshToken) {
      const error = new Error("Backend refresh token is unavailable.");
      error.code = "AUTH_REFRESH_UNAVAILABLE";
      error.authRejected = true;
      throw error;
    }

    try {
      const response = await apiClient.post("/auth/refresh", {
        refreshToken,
      });

      const payload = response?.data?.data || response?.data || {};
      const accessToken = String(
        payload?.accessToken ||
        payload?.access_token ||
        ""
      ).trim();

      if (!accessToken) {
        const error = new Error(
          "Backend refresh response did not contain an access token."
        );
        error.code = "AUTH_REFRESH_INVALID_RESPONSE";
        error.authRejected = true;
        throw error;
      }

      const previousProfile =
        persisted?.profile && typeof persisted.profile === "object"
          ? persisted.profile
          : {};

      const refreshedCustomer =
        payload?.customer && typeof payload.customer === "object"
          ? payload.customer
          : {};

      const profile = {
        ...previousProfile,
        ...refreshedCustomer,
      };

      createSession({
        accessToken,
        refreshToken,
        profile,
      });

      return {
        accessToken,
        refreshToken,
        profile,
      };
    } catch (error) {
      if (error?.authRejected) {
        throw error;
      }

      if (isDefinitiveRefreshRejection(error)) {
        error.authRejected = true;
      }

      throw error;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export function isDefinitiveAuthRecoveryRejection(error) {
  return Boolean(error?.authRejected);
}
