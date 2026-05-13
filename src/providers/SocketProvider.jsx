import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { io }
  from "socket.io-client";

import useRuntimeStore
  from "../stores/runtimeStore";

/**
 * =========================================================
 * SOCKET CONTEXT
 * =========================================================
 */

const SocketContext =
  createContext(null);

/**
 * =========================================================
 * CONNECTION STATES
 * =========================================================
 */

const SOCKET_STATUS = {

  IDLE:
    "idle",

  CONNECTING:
    "connecting",

  CONNECTED:
    "connected",

  RECONNECTING:
    "reconnecting",

  DISCONNECTED:
    "disconnected",

  ERROR:
    "error",

};

/**
 * =========================================================
 * SOCKET PROVIDER
 * =========================================================
 */

function SocketProvider({
  children,
}) {

  /**
   * =======================================================
   * RUNTIME
   * =======================================================
   */

  const runtimeConfig =
    useRuntimeStore(
      (state) =>
        state.config
    );

  const initialized =
    useRuntimeStore(
      (state) =>
        state.initialized
    );

  /**
   * =======================================================
   * SOCKET REF
   * =======================================================
   */

  const socketRef =
    useRef(null);

  const initializedRef =
    useRef(false);

  /**
   * =======================================================
   * STATE
   * =======================================================
   */

  const [status,
    setStatus] =
    useState(
      SOCKET_STATUS.IDLE
    );

  /**
   * =======================================================
   * SOCKET LIFECYCLE
   * =======================================================
   */

  useEffect(() => {

    /**
     * =====================================================
     * WAIT FOR RUNTIME
     * =====================================================
     */

    if (!initialized) {

      return;

    }

    /**
     * =====================================================
     * PREVENT DUPLICATE INIT
     * =====================================================
     */

    if (
      initializedRef.current
    ) {

      return;

    }

    initializedRef.current =
      true;

    /**
     * =====================================================
     * REALTIME CONFIG
     * =====================================================
     */

    const realtime =
      runtimeConfig
        ?.realtime;

    /**
     * =====================================================
     * DISABLED
     * =====================================================
     */

    if (
      !realtime?.enabled
    ) {

      return;

    }

    /**
     * =====================================================
     * SOCKET URL
     * =====================================================
     */

    const socketUrl =
      realtime?.socketUrl;

    /**
     * =====================================================
     * INVALID URL
     * =====================================================
     */

    if (
      typeof socketUrl !==
      "string"
    ) {

      console.error(
        "[SOCKET ERROR] Invalid socket URL"
      );

      setStatus(
        SOCKET_STATUS.ERROR
      );

      return;

    }

    /**
     * =====================================================
     * CONNECTING
     * =====================================================
     */

    setStatus(
      SOCKET_STATUS.CONNECTING
    );

    /**
     * =====================================================
     * SOCKET INSTANCE
     * =====================================================
     */

    const socketInstance =
      io(socketUrl, {

        transports: [
          "websocket",
        ],

        autoConnect:
          true,

        reconnection:
          true,

        reconnectionAttempts:
          Infinity,

        reconnectionDelay:
          2000,

      });

    socketRef.current =
      socketInstance;

    /**
     * =====================================================
     * CONNECT
     * =====================================================
     */

    socketInstance.on(
      "connect",
      () => {

        console.log(
          "✅ Socket connected"
        );

        setStatus(
          SOCKET_STATUS.CONNECTED
        );

      }
    );

    /**
     * =====================================================
     * DISCONNECT
     * =====================================================
     */

    socketInstance.on(
      "disconnect",
      () => {

        setStatus(
          SOCKET_STATUS.DISCONNECTED
        );

      }
    );

    /**
     * =====================================================
     * RECONNECT
     * =====================================================
     */

    socketInstance.io.on(
      "reconnect_attempt",
      () => {

        setStatus(
          SOCKET_STATUS.RECONNECTING
        );

      }
    );

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    socketInstance.on(
      "connect_error",
      (error) => {

        console.error(

          "[SOCKET ERROR]",

          error.message

        );

        setStatus(
          SOCKET_STATUS.ERROR
        );

      }
    );

    /**
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {

      initializedRef.current =
        false;

      socketInstance.disconnect();

      socketRef.current =
        null;

    };

  }, [

    initialized,

  ]);

  /**
   * =======================================================
   * CONTEXT VALUE
   * =======================================================
   */

  const contextValue =
    useMemo(() => {

      return {

        socket:
          socketRef.current,

        connected:

          status ===
          SOCKET_STATUS.CONNECTED,

        status,

      };

    }, [

      status,

    ]);

  return (

    <SocketContext.Provider
      value={
        contextValue
      }
    >

      {children}

    </SocketContext.Provider>

  );

}

/**
 * =========================================================
 * SOCKET HOOK
 * =========================================================
 */

export function
useSocket() {

  return useContext(
    SocketContext
  );

}