import {
  recoverRuntimeSession,
} from "./runtimeSessionRecovery";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  hydrateRuntimeIdentity,
} from "./runtimeAuthHydrator";

export function initializeRuntimeSession() {

  runtimeLogger.info("RUNTIME", 
    "[SESSION] Initializing runtime session"
  );

  recoverRuntimeSession();

  hydrateRuntimeIdentity();

  runtimeLogger.info("RUNTIME", 
    "[SESSION] Runtime session ready"
  );

}