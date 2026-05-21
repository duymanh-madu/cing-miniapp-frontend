import socket from "@/services/socket/socketClient";

/**
 * =====================================================
 * VISIBILITY RECOVERY
 * =====================================================
 */

export function initializeVisibilityRecovery() {

  document.addEventListener(
    "visibilitychange",
    () => {

      /**
       * ============================================
       * TAB ACTIVE AGAIN
       * ============================================
       */

      if (
        document.visibilityState ===
        "visible"
      ) {

        /**
         * ========================================
         * RECOVER SOCKET
         * ========================================
         */

        if (
          !socket.connected
        ) {

          console.log(
            "recovering socket..."
          );

          socket.connect();

        }

      }

    }
  );

}