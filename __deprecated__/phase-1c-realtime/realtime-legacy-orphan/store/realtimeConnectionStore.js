import { create }
  from "zustand";

export const useRealtimeConnectionStore =
  create((set) => ({

    connected: false,

    reconnecting: false,

    latency: 0,

    setConnected(value) {

      set({

        connected:
          value,

      });

    },

    setReconnecting(value) {

      set({

        reconnecting:
          value,

      });

    },

    setLatency(value) {

      set({

        latency:
          value,

      });

    },

  }));