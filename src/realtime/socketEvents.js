import socket
  from "@/sockets/socketClient";

import useSocketStore
  from "@/stores/socketStore";

import useAuthStore
  from "@/stores/authStore";

/**
 * =========================================================
 * SOCKET EVENT ORCHESTRATION
 * =========================================================
 */

let initialized =
  false;

let pingInterval =
  null;

/**
 * =========================================================
 * INITIALIZE SOCKET EVENTS
 * =========================================================
 */

export function
initializeSocketEvents() {

  /**
   * PREVENT DUPLICATE INIT
   */

  if (initialized) {
    return;
  }

  initialized = true;

  /**
   * STORE
   */

  const socketStore =
    useSocketStore.getState();

  /**
   * =======================================================
   * CONNECT
   * =======================================================
   */

  const handleConnect =
    () => {

      console.log(
        "🟢 Socket connected"
      );

      socketStore.setConnected(
        true
      );

      socketStore.setConnecting(
        false
      );

      socketStore.setReconnecting(
        false
      );

      socketStore.setSocketId(
        socket.id || ""
      );

      socketStore.setTransport(
        socket?.io?.engine
          ?.transport?.name ||
          "unknown"
      );

      socketStore.setLastConnectedAt(
        Date.now()
      );

      socketStore.resetReconnect();

      /**
       * USER ROOM
       */

      const user =
        useAuthStore
          .getState()
          .user;

      if (
        user?.id
      ) {

        socket.emit(
          "join_user_channel",
          {
            user_id:
              user.id,
          }
        );
      }
    };

  /**
   * =======================================================
   * DISCONNECT
   * =======================================================
   */

  const handleDisconnect =
    () => {

      console.log(
        "🔴 Socket disconnected"
      );

      socketStore.setConnected(
        false
      );
    };

  /**
   * =======================================================
   * RECONNECT
   * =======================================================
   */

  const handleReconnect =
    () => {

      socketStore.setReconnecting(
        true
      );

      socketStore.incrementReconnect();
    };

  /**
   * =======================================================
   * TRANSPORT UPGRADE
   * =======================================================
   */

  const handleUpgrade =
    (transport) => {

      socketStore.setTransport(
        transport?.name ||
        "unknown"
      );
    };

  /**
   * =======================================================
   * REGISTER EVENTS
   * =======================================================
   */

  socket.on(
    "connect",
    handleConnect
  );

  socket.on(
    "disconnect",
    handleDisconnect
  );

  socket.io.on(
    "reconnect_attempt",
    handleReconnect
  );

  /**
   * =======================================================
   * ENGINE
   * =======================================================
   */

  if (
    socket?.io?.engine
  ) {

    socket.io.engine.on(
      "upgrade",
      handleUpgrade
    );
  }

  /**
   * =======================================================
   * LATENCY MONITOR
   * =======================================================
   */

  pingInterval =
    setInterval(
      () => {

        if (
          !socket.connected
        ) {
          return;
        }

        const start =
          Date.now();

        socket.emit(
          "client_ping"
        );

        socket.once(
          "server_pong",
          () => {

            const latency =
              Date.now() -
              start;

            socketStore.setLatency(
              latency
            );
          }
        );
      },
      15000
    );

  /**
   * =======================================================
   * CONNECT SOCKET
   * =======================================================
   */

  if (
    !socket.connected
  ) {

    socket.connect();
  }
}

/**
 * =========================================================
 * DESTROY SOCKET EVENTS
 * =========================================================
 */

export function
destroySocketEvents() {

  initialized =
    false;

  /**
   * CLEAR INTERVAL
   */

  if (
    pingInterval
  ) {

    clearInterval(
      pingInterval
    );

    pingInterval =
      null;
  }

  /**
   * REMOVE ONLY OWN EVENTS
   */

  socket.off(
    "connect"
  );

  socket.off(
    "disconnect"
  );

  socket.io.off(
    "reconnect_attempt"
  );

  /**
   * DISCONNECT
   */

  socket.disconnect();
}