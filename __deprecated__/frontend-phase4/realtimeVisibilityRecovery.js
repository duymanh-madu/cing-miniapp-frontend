import {

  getRuntimeSocket,

  initializeRuntimeSocket,

} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * REALTIME VISIBILITY RECOVERY
 * =====================================================
 */

class RealtimeVisibilityRecovery {

  initialized =
    false;

  handleVisibilityChange =
    async () => {

      /**
       * ===============================================
       * TAB ACTIVE AGAIN
       * ===============================================
       */

      if (
        document.visibilityState !==
        "visible"
      ) {

        return;

      }

      const socket =
        getRuntimeSocket()

        || initializeRuntimeSocket();

      /**
       * ===============================================
       * RECOVER SOCKET
       * ===============================================
       */

      if (
        socket.connected
      ) {

        return;

      }

      console.log(
        "[REALTIME] Recovering socket..."
      );

      socket.connect();

    };

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    document.addEventListener(

      "visibilitychange",

      this.handleVisibilityChange

    );

    this.initialized =
      true;

  }

  cleanup() {

    document.removeEventListener(

      "visibilitychange",

      this.handleVisibilityChange

    );

    this.initialized =
      false;

  }

}

const realtimeVisibilityRecovery =
  new RealtimeVisibilityRecovery();

export default
  realtimeVisibilityRecovery;