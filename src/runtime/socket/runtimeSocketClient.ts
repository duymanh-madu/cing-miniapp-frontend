import {
  io,
  Socket,
} from "socket.io-client";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  useRuntimeSystemStore,
} from "@/runtime/system/runtimeSystemStore";

/**
 * =====================================================
 * ENTERPRISE RUNTIME SOCKET CLIENT
 * =====================================================
 * ZALO WEBVIEW HARDENED
 * MOBILE-FIRST
 * REALTIME GOVERNED
 * MEMORY SAFE
 * =====================================================
 */

type SocketEventHandler =
  (...args: any[]) => void;

/**
 * =====================================================
 * SOCKET SINGLETON
 * =====================================================
 */

let runtimeSocket:
  Socket | null = null;

/**
 * =====================================================
 * GOVERNANCE STATE
 * =====================================================
 */

const registeredListeners =
  new Map<
    string,
    Set<SocketEventHandler>
  >();

let initialized =
  false;

let visibilityBound =
  false;

let heartbeatInterval:
  ReturnType<
    typeof setInterval
  > | null = null;

/**
 * =====================================================
 * SOCKET URL
 * =====================================================
 */

const SOCKET_URL =
  import.meta.env
    .VITE_SOCKET_URL;

/**
 * =====================================================
 * INTERNAL HELPERS
 * =====================================================
 */

function setConnected(
  connected: boolean
) {

  useRuntimeSystemStore
    .getState()
    .setConnected(
      connected
    );

}

function startHeartbeat() {

  if (
    heartbeatInterval
  ) {

    return;

  }

  heartbeatInterval =
    setInterval(
      () => {

        if (
          !runtimeSocket ||
          !runtimeSocket.connected
        ) {

          return;

        }

        runtimeSocket.emit(
          "runtime:heartbeat",
          {
            timestamp:
              Date.now(),
          }
        );

      },
      30000
    );

}

function stopHeartbeat() {

  if (
    !heartbeatInterval
  ) {

    return;

  }

  clearInterval(
    heartbeatInterval
  );

  heartbeatInterval =
    null;

}

function bindVisibilityRecovery() {

  if (
    visibilityBound
  ) {

    return;

  }

  const recoverSocket =
    () => {

      if (
        document.visibilityState !==
        "visible"
      ) {

        return;

      }

      if (
        !runtimeSocket
      ) {

        return;

      }

      if (
        runtimeSocket.connected
      ) {

        return;

      }

      runtimeLogger.info("RUNTIME", 
        "[SOCKET] VISIBILITY RECOVERY"
      );

      runtimeSocket.connect();

    };

  document.addEventListener(
    "visibilitychange",
    recoverSocket
  );

  window.addEventListener(
    "focus",
    recoverSocket
  );

  visibilityBound =
    true;

}

/**
 * =====================================================
 * SAFE EVENT REGISTER
 * =====================================================
 */

export function registerSocketListener(
  event: string,
  handler: SocketEventHandler
) {

  if (
    !runtimeSocket
  ) {

    throw new Error(
      "[SOCKET] SOCKET NOT INITIALIZED"
    );

  }

  if (
    !registeredListeners.has(
      event
    )
  ) {

    registeredListeners.set(
      event,
      new Set()
    );

  }

  const handlers =
    registeredListeners.get(
      event
    ) as Set<SocketEventHandler>;

  /**
   * ===================================================
   * DUPLICATE PROTECTION
   * ===================================================
   */

  if (
    handlers.has(
      handler
    )
  ) {

    runtimeLogger.warn("RUNTIME", 
      "[SOCKET] DUPLICATE LISTENER BLOCKED",
      event
    );

    return () => {};

  }

  handlers.add(
    handler
  );

  runtimeSocket.on(
    event,
    handler
  );

  /**
   * ===================================================
   * UNSUBSCRIBE
   * ===================================================
   */

  return () => {

    if (
      !runtimeSocket
    ) {

      return;

    }

    runtimeSocket.off(
      event,
      handler
    );

    handlers.delete(
      handler
    );

    if (
      handlers.size === 0
    ) {

      registeredListeners.delete(
        event
      );

    }

  };

}

/**
 * =====================================================
 * INITIALIZE SOCKET
 * =====================================================
 */

export function initializeRuntimeSocket() {

  /**
   * ===================================================
   * SINGLETON PROTECTION
   * ===================================================
   */

  if (
    runtimeSocket
  ) {

    return runtimeSocket;

  }

  runtimeLogger.info("RUNTIME", 
    "[SOCKET] INITIALIZING..."
  );

  /**
   * ===================================================
   * SOCKET INSTANCE
   * ===================================================
   */

  runtimeSocket =
    io(
      SOCKET_URL,
      {

        /**
         * ===============================================
         * TRANSPORT GOVERNANCE
         * ===============================================
         */

        transports: [

          "websocket",

          "polling",

        ],

        /**
         * ===============================================
         * CONNECTION GOVERNANCE
         * ===============================================
         */

        autoConnect:
          true,

        forceNew:
          false,

        withCredentials:
          true,

        /**
         * ===============================================
         * RECONNECT GOVERNANCE
         * ===============================================
         */

        reconnection:
          true,

        reconnectionAttempts:
          Infinity,

        reconnectionDelay:
          1500,

        reconnectionDelayMax:
          10000,

        randomizationFactor:
          0.5,

        timeout:
          20000,

      }
    );

  /**
   * ===================================================
   * PREVENT DOUBLE INITIALIZATION
   * ===================================================
   */

  if (
    initialized
  ) {

    return runtimeSocket;

  }

  initialized =
    true;

  /**
   * ===================================================
   * LIFECYCLE EVENTS
   * ===================================================
   */

  runtimeSocket.on(
    "connect",
    () => {
      (window as any).__runtimeSocket = runtimeSocket;

      runtimeLogger.info("RUNTIME", 
        "[SOCKET] CONNECTED"
      );

      setConnected(
        true
      );

      startHeartbeat();

      // Emit user:online để admin dashboard track
      try {
        const { useRuntimeCustomerIdentityStore } = require("../customer/runtimeCustomerIdentityStore");
        const identity = useRuntimeCustomerIdentityStore.getState().identity;
        const phone = (identity?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
        if (phone && phone !== "pending" && phone.length >= 9) {
          runtimeSocket?.emit("user:online", {
            userId: phone,
            name: identity?.fullName || "",
            avatar: identity?.avatar || "",
          });
        }
      } catch(e) {}

    }
  );

  runtimeSocket.on(
    "disconnect",
    (
      reason
    ) => {

      runtimeLogger.warn("RUNTIME", 
        "[SOCKET] DISCONNECTED",
        reason
      );

      setConnected(
        false
      );

      stopHeartbeat();

    }
  );

  runtimeSocket.on(
    "connect_error",
    (
      error
    ) => {

      runtimeLogger.error("RUNTIME", 
        "[SOCKET] CONNECT ERROR",
        error
      );

    }
  );

  runtimeSocket.on(
    "reconnect_attempt",
    (
      attempt
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[SOCKET] RECONNECT ATTEMPT",
        attempt
      );

    }
  );

  runtimeSocket.on(
    "reconnect",
    (
      attempt
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[SOCKET] RECONNECTED",
        attempt
      );

      setConnected(
        true
      );

    }
  );

  runtimeSocket.on(
    "reconnect_failed",
    () => {

      runtimeLogger.error("RUNTIME", 
        "[SOCKET] RECONNECT FAILED"
      );

    }
  );

  runtimeSocket.on(
    "error",
    (
      error
    ) => {

      runtimeLogger.error("RUNTIME", 
        "[SOCKET] SOCKET ERROR",
        error
      );

    }
  );

  /**
   * ===================================================
   * VISIBILITY RECOVERY
   * ===================================================
   */

  bindVisibilityRecovery();

  /**
   * ===================================================
   * READY
   * ===================================================
   */

  runtimeLogger.info("RUNTIME", 
    "[SOCKET] READY"
  );

  return runtimeSocket;

}

/**
 * =====================================================
 * GET SOCKET
 * =====================================================
 */

export function getRuntimeSocket() {

  return runtimeSocket;

}

/**
 * =====================================================
 * SOCKET METRICS
 * =====================================================
 */

export function getSocketMetrics() {

  return {

    connected:
      runtimeSocket?.connected ||
      false,

    listenerEvents:
      registeredListeners.size,

    totalListeners:
      Array.from(
        registeredListeners.values()
      ).reduce(
        (
          total,
          handlers
        ) => {

          return (
            total +
            handlers.size
          );

        },
        0
      ),

  };

}

/**
 * =====================================================
 * SAFE DISCONNECT
 * =====================================================
 */

export function disconnectRuntimeSocket() {

  if (
    !runtimeSocket
  ) {

    return;

  }

  runtimeLogger.info("RUNTIME", 
    "[SOCKET] DISCONNECTING..."
  );

  stopHeartbeat();

  registeredListeners.clear();

  runtimeSocket.removeAllListeners();

  runtimeSocket.disconnect();

  runtimeSocket =
    null;

  initialized =
    false;

  setConnected(
    false
  );

  runtimeLogger.info("RUNTIME", 
    "[SOCKET] DISCONNECTED CLEANLY"
  );

}
/**
 * =====================================================
 * COMPATIBILITY SOCKET API
 * =====================================================
 * Used by legacy bridge "@/realtime/socket".
 * Must not create a new socket instance.
 * =====================================================
 */

export function runtimeSocketOn(
  event: string,
  handler: SocketEventHandler
) {

  return registerSocketListener(
    event,
    handler
  );

}

export function runtimeSocketOff(
  event: string,
  handler: SocketEventHandler
) {

  if (!runtimeSocket) {
    return;
  }

  runtimeSocket.off(
    event,
    handler
  );

  const handlers =
    registeredListeners.get(
      event
    );

  handlers?.delete(
    handler
  );

  if (
    handlers &&
    handlers.size === 0
  ) {
    registeredListeners.delete(
      event
    );
  }

}

export function runtimeSocketEmit(
  event: string,
  payload?: unknown
) {

  if (!runtimeSocket) {

    runtimeLogger.warn(
      "RUNTIME",
      "[SOCKET] EMIT BLOCKED - SOCKET NOT INITIALIZED",
      event
    );

    return false;

  }

  runtimeSocket.emit(
    event,
    payload
  );

  return true;

}
