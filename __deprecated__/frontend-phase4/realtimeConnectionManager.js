import {

  getRuntimeSocket,

  initializeRuntimeSocket,

} from "@/runtime/socket/runtimeSocketClient";

import {

  useRealtimeConnectionStore,

} from "../store/realtimeConnectionStore";

/**
 * =====================================================
 * REALTIME CONNECTION MANAGER
 * =====================================================
 */

class RealtimeConnectionManager {

  initialized =
    false;

  socket =
    null;

  handleConnect =
    () => {

      const store =
        useRealtimeConnectionStore
          .getState();

      store.setConnected(
        true
      );

      store.setReconnecting(
        false
      );

    };

  handleDisconnect =
    () => {

      useRealtimeConnectionStore
        .getState()
        .setConnected(
          false
        );

    };

  handleReconnectAttempt =
    () => {

      useRealtimeConnectionStore
        .getState()
        .setReconnecting(
          true
        );

    };

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    this.socket =
      getRuntimeSocket()

      || initializeRuntimeSocket();

    /**
     * ===============================================
     * REGISTER
     * ===============================================
     */

    this.socket.on(

      "connect",

      this.handleConnect

    );

    this.socket.on(

      "disconnect",

      this.handleDisconnect

    );

    this.socket.on(

      "reconnect_attempt",

      this.handleReconnectAttempt

    );

    this.initialized =
      true;

  }

  /**
   * ===============================================
   * CLEANUP
   * ===============================================
   */

  cleanup() {

    if (
      !this.socket
    ) {

      return;

    }

    this.socket.off(

      "connect",

      this.handleConnect

    );

    this.socket.off(

      "disconnect",

      this.handleDisconnect

    );

    this.socket.off(

      "reconnect_attempt",

      this.handleReconnectAttempt

    );

    this.initialized =
      false;

  }

  /**
   * ===============================================
   * DESTROY
   * ===============================================
   */

  destroy() {

    this.cleanup();

    this.socket =
      null;

  }

}

const realtimeConnectionManager =
  new RealtimeConnectionManager();

export default
  realtimeConnectionManager;