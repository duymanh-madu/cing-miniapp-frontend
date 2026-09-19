import {
  openAuthenticatedRuntimeSession,
} from "@/infra/auth/authenticatedRuntimeSession";

let recoveryInFlight = null;

export function recoverProtectedRouteAuth() {
  if (recoveryInFlight) {
    return recoveryInFlight;
  }

  const operation = (async () => {
    const result =
      await openAuthenticatedRuntimeSession();

    return {
      authenticated:
        result === "authenticated",
      result,
    };
  })();

  recoveryInFlight =
    operation.finally(() => {
      recoveryInFlight = null;
    });

  return recoveryInFlight;
}
