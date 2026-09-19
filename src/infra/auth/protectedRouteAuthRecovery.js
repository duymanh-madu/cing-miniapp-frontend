import {
  openAuthenticatedRuntimeSession,
  getAuthenticatedRuntimeSessionDiagnostic,
} from "@/infra/auth/authenticatedRuntimeSession";

let recoveryInFlight = null;

export function recoverProtectedRouteAuth() {
  if (recoveryInFlight) {
    return recoveryInFlight;
  }

  const operation = (async () => {
    const result =
      await openAuthenticatedRuntimeSession();

    const diagnostic =
      getAuthenticatedRuntimeSessionDiagnostic();

    return {
      authenticated:
        result === "authenticated",
      result:
        result === "transient_failure"
          ? `${result} · ${diagnostic}`
          : result,
    };
  })();

  recoveryInFlight =
    operation.finally(() => {
      recoveryInFlight = null;
    });

  return recoveryInFlight;
}
