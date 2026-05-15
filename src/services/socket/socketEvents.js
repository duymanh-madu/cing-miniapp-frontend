import socketManager from "@/services/socket/socketManager";

/**
 * =====================================================
 * SOCKET EVENTS
 * =====================================================
 */

export function registerSocketEvents() {

  /**
   * ============================================
   * CONNECT
   * ============================================
   */

  socketManager.socket?.on(
    "connect",
    () => {

      console.log(
        "socket connected",
        socket.id
      );

    }
  );

  /**
   * ============================================
   * DISCONNECT
   * ============================================
   */

  socketManager.socket?.on(
    "disconnect",
    (
      reason
    ) => {

      console.log(
        "socket disconnected",
        reason
      );

    }
  );

  /**
   * ============================================
   * CONNECT ERROR
   * ============================================
   */

  socketManager.socket?.on(
    "connect_error",
    (
      error
    ) => {

      console.error(
        "socket connect error",
        error.message
      );

    }
  );

}