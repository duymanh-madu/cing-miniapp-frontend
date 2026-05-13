import {
  create,
} from "zustand";

/**
 * ============================================
 * SYSTEM STORE
 * ============================================
 */

const useSystemStore =
  create((set) => ({
    /**
     * SYSTEM
     */

    initialized: false,

    bootCompleted: false,

    bootTimestamp: null,

    environment:
      import.meta.env.MODE,

    /**
     * NETWORK
     */

    online:
      navigator.onLine,

    /**
     * PERFORMANCE
     */

    fps: 60,

    memoryUsage: null,

    /**
     * ACTIONS
     */

    setInitialized:
      (value) =>
        set({
          initialized:
            value,
        }),

    setBootCompleted:
      (value) =>
        set({
          bootCompleted:
            value,

          bootTimestamp:
            Date.now(),
        }),

    setOnline:
      (value) =>
        set({
          online: value,
        }),

    setFPS:
      (value) =>
        set({
          fps: value,
        }),

    setMemoryUsage:
      (value) =>
        set({
          memoryUsage:
            value,
        }),
  }));

export default useSystemStore;