export const createRealtimeSlice =
  (set) => ({

    connected: false,

    latency: 0,

    setConnected(value) {

      set({

        connected: value,

      });

    },

    setLatency(value) {

      set({

        latency: value,

      });

    },

  });