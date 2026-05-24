import {
  useEffect,
  useState,
} from "react";

import {
  getRuntimeSocket,
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * ADMIN REALTIME HOOK
 * =====================================================
 * ENTERPRISE REALTIME GOVERNANCE
 * ZALO WEBVIEW SAFE
 * MOBILE SAFE
 * MEMORY SAFE
 * =====================================================
 */

function useAdminRealtime() {

  /**
   * ===================================================
   * STATES
   * ===================================================
   */

  const [
    connected,
    setConnected,
  ] = useState(false);

  const [
    latency,
    setLatency,
  ] = useState(0);

  /**
   * ===================================================
   * SOCKET LIFECYCLE
   * ===================================================
   */

  useEffect(() => {

    const socket =
      getRuntimeSocket();

    /**
     * ===============================================
     * SOCKET NOT READY
     * ===============================================
     */

    if (
      !socket
    ) {

      return;

    }

    /**
     * ===============================================
     * INITIAL HYDRATION
     * ===============================================
     */

    setConnected(
      socket.connected
    );

    /**
     * ===============================================
     * CONNECT
     * ===============================================
     */

    const unsubscribeConnect =
      registerSocketListener(

        "connect",

        () => {

          setConnected(
            true
          );

        }

      );

    /**
     * ===============================================
     * DISCONNECT
     * ===============================================
     */

    const unsubscribeDisconnect =
      registerSocketListener(

        "disconnect",

        () => {

          setConnected(
            false
          );

        }

      );

    /**
     * ===============================================
     * LATENCY UPDATE
     * ===============================================
     */

    const unsubscribeLatency =
      registerSocketListener(

        "latency:update",

        (
          payload
        ) => {

          setLatency(

            payload?.latency || 0

          );

        }

      );

    /**
     * ===============================================
     * CLEANUP
     * ===============================================
     */

    return () => {

      unsubscribeConnect?.();

      unsubscribeDisconnect?.();

      unsubscribeLatency?.();

    };

  }, []);

  /**
   * ===================================================
   * EXPORTS
   * ===================================================
   */

  return {

    connected,

    latency,

  };

}

export default
  useAdminRealtime;