import {
  useEffect,
} from "react";

import {
  useSocket,
}
from "@/providers/SocketProvider";

import useAuthStore from "../stores/authStore";

import {
  initializeSocketEvents,
  destroySocketEvents,
} from "../realtime/socketEvents";

/**
 * ============================================
 * USE SOCKET CONNECTION
 * ============================================
 */

function useSocketConnection() {
  const authenticated =
    useAuthStore(
      (state) =>
        state.authenticated
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  useEffect(() => {
    /**
     * AUTH
     */

    socket.auth = {
      token:
        accessToken,
    };

    /**
     * EVENTS
     */

    initializeSocketEvents();

    /**
     * CONNECT
     */

    socket.connect();

    return () => {
      destroySocketEvents();

      socket.disconnect();
    };
  }, [
    authenticated,
    accessToken,
  ]);
}

export default useSocketConnection;