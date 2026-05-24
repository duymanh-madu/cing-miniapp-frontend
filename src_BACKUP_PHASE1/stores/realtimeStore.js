import {
  create,
} from "zustand";

/**
 * =====================================================
 * REALTIME COMPATIBILITY STORE
 * =====================================================
 * Legacy UI hooks can read connection state here.
 * Runtime transport remains governed by runtimeSocketClient.
 * =====================================================
 */

const useRealtimeStore =
  create((set) => ({

    connected:
      false,

    status:
      "idle",

    lastEvent:
      null,

    overlays:
      [],

    setConnected(
      connected
    ) {

      set({
        connected,
        status:
          connected
            ? "connected"
            : "disconnected",
      });

    },

    setStatus(
      status
    ) {

      set({
        status,
      });

    },

    pushOverlay(
      overlay
    ) {

      set((state) => ({

        overlays: [
          overlay,
          ...state.overlays,
        ].slice(0, 10),

        lastEvent:
          overlay,

      }));

    },

    clearOverlays() {

      set({
        overlays: [],
      });

    },

  }));

export default useRealtimeStore;
