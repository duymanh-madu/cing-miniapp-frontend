import {
  hasSession,
} from "./authSession";

import useAuthStore from "./authState";

export function bootstrapAuth() {

  const authenticated =
    hasSession();

  useAuthStore
    .getState()
    .setAuthenticated(
      authenticated
    );

  console.log(
    "🟢 AUTH READY"
  );
}