import {
  getPersistedRuntimeSession,
} from "./runtimeSessionPersistence";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  useRuntimeSessionStore,
} from "./runtimeSessionStore";

export function recoverRuntimeSession() {

  const persisted =
    getPersistedRuntimeSession();

  if (!persisted) {

    runtimeLogger.info("RUNTIME", 
      "[SESSION] No persisted session"
    );

    return;
  }

  useRuntimeSessionStore
    .getState()
    .setSession({

      sessionId:
        persisted.sessionId,

      connected:
        false,

      hydrated:
        true,

      lastConnectedAt:
        persisted.lastConnectedAt,

    });

  runtimeLogger.info("RUNTIME", 
    "[SESSION] Recovered persisted session"
  );

}