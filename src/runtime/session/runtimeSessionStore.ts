import { create } from "zustand";

interface RuntimeSessionState {

  sessionId:
    string | null;

  connected:
    boolean;

  hydrated:
    boolean;

  lastConnectedAt:
    string | null;

  setSession: (
    payload: {

      sessionId:
        string | null;

      connected:
        boolean;

      hydrated:
        boolean;

      lastConnectedAt:
        string | null;

    }
  ) => void;

}

export const useRuntimeSessionStore =
  create<RuntimeSessionState>(

    (
      set
    ) => ({

      sessionId:
        null,

      connected:
        false,

      hydrated:
        false,

      lastConnectedAt:
        null,

      setSession: (
        payload
      ) => set({

        sessionId:
          payload.sessionId,

        connected:
          payload.connected,

        hydrated:
          payload.hydrated,

        lastConnectedAt:
          payload.lastConnectedAt,

      }),

    })

  );