import {

  create,

} from "zustand";

/**
 * =====================================================
 * RUNTIME SYSTEM STORE
 * =====================================================
 */

interface RuntimeSystemState {

  connected:
    boolean;

  booted:
    boolean;

  lastConnectedAt:
    number | null;

  setConnected:
    (
      connected: boolean
    ) => void;

  setBooted:
    (
      booted: boolean
    ) => void;

}

export const useRuntimeSystemStore =
  create<RuntimeSystemState>(
    (
      set
    ) => ({

      connected:
        false,

      booted:
        false,

      lastConnectedAt:
        null,

      setConnected:
        (
          connected
        ) => {

          set({

            connected,

            lastConnectedAt:
              connected
                ? Date.now()
                : null,

          });

        },

      setBooted:
        (
          booted
        ) => {

          set({

            booted,

          });

        },

    })
  );