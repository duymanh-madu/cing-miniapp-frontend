import { create } from "zustand";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

interface RuntimeSystemState {

  connected: boolean;

  runtime_ready: boolean;

  maintenance_mode: boolean;

  reconnecting: boolean;

  setConnected: (
    value: boolean
  ) => void;

  setRuntimeReady: (
    value: boolean
  ) => void;

  setMaintenanceMode: (
    value: boolean
  ) => void;

  setReconnecting: (
    value: boolean
  ) => void;

}

/**
 * =====================================================
 * STORE
 * =====================================================
 */

export const useRuntimeSystemStore =
  create<
    RuntimeSystemState
  >(

    (
      set
    ) => ({

      connected: false,

      runtime_ready: false,

      maintenance_mode: false,

      reconnecting: false,

      setConnected: (
        value
      ) =>

        set({

          connected:
            value,

        }),

      setRuntimeReady: (
        value
      ) =>

        set({

          runtime_ready:
            value,

        }),

      setMaintenanceMode: (
        value
      ) =>

        set({

          maintenance_mode:
            value,

        }),

      setReconnecting: (
        value
      ) =>

        set({

          reconnecting:
            value,

        }),

    })

  );