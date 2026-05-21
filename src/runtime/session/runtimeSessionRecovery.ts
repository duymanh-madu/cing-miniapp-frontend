import {
  getPersistedRuntimeSession,
} from "./runtimeSessionPersistence";

import {
  useRuntimeSessionStore,
} from "./runtimeSessionStore";

export function recoverRuntimeSession() {

  const persisted =
    getPersistedRuntimeSession();

  if (!persisted) {

    console.log(
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

  console.log(
    "[SESSION] Recovered persisted session"
  );

}