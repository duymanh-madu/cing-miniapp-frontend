import {
  create,
} from "zustand";

/**
 * ============================================
 * SOCKET STORE
 * ============================================
 */

const useSocketStore =
  create((set) => ({
    /**
     * STATE
     */

    connected: false,

    connecting: false,

    reconnecting: false,

    transport: "polling",

    socketId: null,

    latency: null,

    lastConnectedAt:
      null,

    reconnectAttempts: 0,

    /**
     * ACTIONS
     */

    setConnected:
      (value) =>
        set({
          connected: value,
        }),

    setConnecting:
      (value) =>
        set({
          connecting: value,
        }),

    setReconnecting:
      (value) =>
        set({
          reconnecting:
            value,
        }),

    setTransport:
      (value) =>
        set({
          transport:
            value,
        }),

    setSocketId:
      (value) =>
        set({
          socketId: value,
        }),

    setLatency:
      (value) =>
        set({
          latency: value,
        }),

    setLastConnectedAt:
      (value) =>
        set({
          lastConnectedAt:
            value,
        }),

    incrementReconnect:
      () =>
        set((state) => ({
          reconnectAttempts:
            state.reconnectAttempts +
            1,
        })),

    resetReconnect:
      () =>
        set({
          reconnectAttempts: 0,
        }),
  }));

export default useSocketStore;