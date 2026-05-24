import { create } from "zustand";

/**
 * =========================================================
 * SYSTEM STORE
 * =========================================================
 */

const useSystemStore = create(
  (set) => ({
    runtimeReady: false,

    runtimeBootedAt: null,

    runtimeError: null,

    setRuntimeReady: (
      runtimeReady
    ) => {
      set({
        runtimeReady,
      });
    },
  })
);

export default useSystemStore;