import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { createSession } from "@/infra/auth/authSession";

import {
  getPersistedAuthSession,
} from "@/infra/auth/persistedAuthSession";

import {
  recoverBackendAuthSession,
  isDefinitiveAuthRecoveryRejection,
} from "@/infra/auth/authRecovery";

import {
  getOrCreateRuntimeDeviceId,
} from "@/runtime/session/runtimeDeviceIdentity";

export type AuthenticatedRuntimeSessionResult =
  | "authenticated"
  | "no_access_token"
  | "auth_rejected"
  | "transient_failure";

let authenticatedRuntimeSessionDiagnostic =
  "pending";

function classifyAuthTransportFailure(
  stage: string,
  error: any
) {
  const status =
    Number(
      error?.response?.status ||
      0
    );

  if (status) {
    return `${stage} · HTTP_${status}`;
  }

  const code =
    String(
      error?.code ||
      ""
    ).trim();

  if (code) {
    return `${stage} · ${code}`;
  }

  if (
    error?.request &&
    !error?.response
  ) {
    return `${stage} · NETWORK`;
  }

  return `${stage} · UNKNOWN`;
}

export function getAuthenticatedRuntimeSessionDiagnostic() {
  return authenticatedRuntimeSessionDiagnostic;
}

async function openAuthenticatedRuntimeSessionAuthority():
  Promise<AuthenticatedRuntimeSessionResult> {
  const persisted =
    getPersistedAuthSession();

  const accessToken =
    persisted.accessToken;

  const refreshToken =
    persisted.refreshToken;

  const installationId =
    getOrCreateRuntimeDeviceId();

  const openSession = async (
    token: string
  ) => {
    return apiClient.post(
      "/auth/session/open",
      {
        installation_id:
          installationId,

        source:
          "zalo-miniapp-session",
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );
  };

  const hydrateAcceptedSession = (
    acceptedAccessToken: string,
    response: any
  ) => {
    const customer =
      response?.data?.data?.customer ||
      response?.data?.customer;

    const customerId =
      String(customer?.id || "").trim();

    const customerPhone =
      String(customer?.phone || "")
        .replace(/\\D/g, "")
        .replace(/^84/, "0");

    if (
      !customerId ||
      !customerPhone ||
      customerPhone.length < 9
    ) {
      const error: any = new Error(
        "Backend-accepted session has no valid customer identity."
      );
      error.code = "AUTH_SESSION_CUSTOMER_MISSING";
      throw error;
    }

    const current =
      getPersistedAuthSession();

    if (
      current.accessToken !==
      acceptedAccessToken
    ) {
      const error: any = new Error(
        "Authenticated session changed before hydration."
      );
      error.code = "AUTH_SESSION_SUPERSEDED";
      throw error;
    }


    const existingProfile =
      current.session?.profile &&
      typeof current.session.profile === "object"
        ? current.session.profile
        : {};

    const existingPhone =
      String(existingProfile?.phone || "")
        .replace(/\D/g, "")
        .replace(/^84/, "0");

    const sameCustomer =
      String(existingProfile?.id || "").trim() ===
        customerId &&
      existingPhone === customerPhone;

    const profile = {
      ...(sameCustomer ? existingProfile : {}),
      ...customer,
      id: customerId,
      phone: customerPhone,
    };

    createSession({
      accessToken:
        acceptedAccessToken,
      refreshToken:
        current.refreshToken,
      profile,
    });
  };

  const recoverAndOpen =
    async ():
      Promise<AuthenticatedRuntimeSessionResult> => {
      let recovered: any;

      try {
        recovered =
          await recoverBackendAuthSession();
      } catch (error: any) {
        if (
          isDefinitiveAuthRecoveryRejection(
            error
          )
        ) {
          authenticatedRuntimeSessionDiagnostic =
            "refresh · AUTH_REJECTED";

          return "auth_rejected";
        }

        authenticatedRuntimeSessionDiagnostic =
          classifyAuthTransportFailure(
            "refresh",
            error
          );

        return "transient_failure";
      }

      const recoveredAccessToken =
        String(
          recovered?.accessToken ||
          ""
        ).trim();

      if (!recoveredAccessToken) {
        return "auth_rejected";
      }

      try {
        const opened =
          await openSession(
            recoveredAccessToken
          );

        /*
         * recoverBackendAuthSession() already persisted the
         * canonical session through createSession().
         * Re-hydrate from canonical storage only after the
         * backend accepts the refreshed JWT.
         */
        hydrateAcceptedSession(
          recoveredAccessToken,
          opened
        );

        return "authenticated";
      } catch (error: any) {
        const status =
          Number(
            error?.response?.status ||
            0
          );

        if (
          status === 400 ||
          status === 401 ||
          status === 403
        ) {
          authenticatedRuntimeSessionDiagnostic =
            `open_refreshed · HTTP_${status}`;

          return "auth_rejected";
        }

        authenticatedRuntimeSessionDiagnostic =
          classifyAuthTransportFailure(
            "open_refreshed",
            error
          );

        return "transient_failure";
      }
    };

  /*
   * Refresh-only cold start:
   *
   * A missing access token is not equivalent to an unauthenticated
   * user while a canonical refresh token still exists.
   *
   * Recover through the single-flight canonical authority before
   * falling back to the slower Zalo shell recovery path.
   */
  if (!accessToken) {
    if (!refreshToken) {
      return "no_access_token";
    }

    return recoverAndOpen();
  }

  try {
    const opened =
      await openSession(
        accessToken
      );

    hydrateAcceptedSession(
      accessToken,
      opened
    );

    authenticatedRuntimeSessionDiagnostic =
      "open_existing · AUTHENTICATED";

    return "authenticated";
  } catch (error: any) {
    if (
      error?.response?.status !==
      401
    ) {
      authenticatedRuntimeSessionDiagnostic =
        classifyAuthTransportFailure(
          "open_existing",
          error
        );

      return "transient_failure";
    }

    if (!refreshToken) {
      authenticatedRuntimeSessionDiagnostic =
        "open_existing · HTTP_401_NO_REFRESH";

      return "auth_rejected";
    }
  }

  /*
   * Persisted access token was rejected, but the refresh token
   * remains authoritative. Reuse the same canonical recovery path
   * instead of maintaining a second refresh implementation here.
   */
  return recoverAndOpen();
}

let authenticatedRuntimeSessionInFlight:
  Promise<AuthenticatedRuntimeSessionResult> | null = null;

export function openAuthenticatedRuntimeSession():
  Promise<AuthenticatedRuntimeSessionResult> {
  if (authenticatedRuntimeSessionInFlight) {
    return authenticatedRuntimeSessionInFlight;
  }

  const operation =
    openAuthenticatedRuntimeSessionAuthority();

  authenticatedRuntimeSessionInFlight =
    operation.finally(() => {
      authenticatedRuntimeSessionInFlight = null;
    });

  return authenticatedRuntimeSessionInFlight;
}
