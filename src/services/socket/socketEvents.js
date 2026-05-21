import socket from "@/services/socket/socketManager";

import useRealtimeStore from "@/stores/realtimeStore";

/**
 * =====================================================
 * SAFE STORE ACCESS
 * =====================================================
 */

function getRealtimeActions() {

  try {

    const store =
      useRealtimeStore.getState?.();

    return {

      setConnected:
        typeof store?.setConnected ===
        "function"

          ? store.setConnected

          : null,

    };

  }

  catch (error) {

    console.error(
      "Realtime store error:",
      error
    );

    return {

      setConnected: null,

    };

  }

}

/**
 * =====================================================
 * SOCKET EVENTS
 * =====================================================
 */

export function registerSocketEvents() {

  const {

    setConnected,

  } = getRealtimeActions();

  /**
   * =================================================
   * SAFE CONNECTED UPDATE
   * =================================================
   */

  function updateConnection(
    state
  ) {

    if (
      typeof setConnected ===
      "function"
    ) {

      setConnected(state);

    }

  }

  /**
   * =================================================
   * CONNECT
   * =================================================
   */

  socket.on(
    "connect",
    () => {

      updateConnection(
        true
      );

      console.log(
        "✅ socket connected:",
        socket.id
      );

    }
  );

  /**
   * =================================================
   * DISCONNECT
   * =================================================
   */

  socket.on(
    "disconnect",
    (
      reason
    ) => {

      updateConnection(
        false
      );

      console.log(
        "⚠️ socket disconnected:",
        reason
      );

    }
  );

  /**
   * =================================================
   * CONNECT ERROR
   * =================================================
   */

  socket.on(
    "connect_error",
    (
      error
    ) => {

      updateConnection(
        false
      );

      console.error(
        "❌ socket connect error:",
        error?.message
      );

    }
  );

  /**
   * =================================================
   * RECONNECT
   * =================================================
   */

  socket.io.on(
    "reconnect",
    (
      attempt
    ) => {

      updateConnection(
        true
      );

      console.log(
        `🔄 socket reconnected (${attempt})`
      );

    }
  );

  /**
   * =================================================
   * RECONNECT ERROR
   * =================================================
   */

  socket.io.on(
    "reconnect_error",
    (
      error
    ) => {

      updateConnection(
        false
      );

      console.error(
        "❌ reconnect error:",
        error?.message
      );

    }
  );

}