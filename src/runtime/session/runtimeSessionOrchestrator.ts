import {
  recoverRuntimeSession,
} from "./runtimeSessionRecovery";

import {
  hydrateRuntimeIdentity,
} from "./runtimeAuthHydrator";

export function initializeRuntimeSession() {

  console.log(
    "[SESSION] Initializing runtime session"
  );

  recoverRuntimeSession();

  hydrateRuntimeIdentity();

  console.log(
    "[SESSION] Runtime session ready"
  );

}