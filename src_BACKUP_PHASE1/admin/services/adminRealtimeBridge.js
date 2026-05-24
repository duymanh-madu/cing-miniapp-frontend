import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import useAdminStore from "../store/adminStore";

/**
 * =====================================================
 * ADMIN REALTIME BRIDGE
 * =====================================================
 * CENTRALIZED
 * MEMORY SAFE
 * DUPLICATE SAFE
 * GOVERNED
 * =====================================================
 */

class AdminRealtimeBridge {

  initialized =
    false;

  unsubscribers =
    [];

  /**
   * ===================================================
   * INITIALIZE
   * ===================================================
   */

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    /**
     * ================================================
     * ADMIN ACTIVITY
     * ================================================
     */

    const unsubscribeActivity =
      registerSocketListener(

        "admin.activity",

        (
          payload
        ) => {

          useAdminStore
            .getState()
            .pushActivityLog(
              payload
            );

        }

      );

    /**
     * ================================================
     * ADMIN ALERT
     * ================================================
     */

    const unsubscribeAlert =
      registerSocketListener(

        "admin.alert",

        (
          payload
        ) => {

          useAdminStore
            .getState()
            .pushRealtimeAlert(
              payload
            );

        }

      );

    /**
     * ================================================
     * TRACK CLEANUP
     * ================================================
     */

    this.unsubscribers.push(

      unsubscribeActivity,

      unsubscribeAlert,

    );

    this.initialized =
      true;

    runtimeLogger.info("ADMIN_REALTIME", 
      "[ADMIN REALTIME] READY"
    );

  }

  /**
   * ===================================================
   * DESTROY
   * ===================================================
   */

  destroy() {

    this.unsubscribers.forEach(
      (
        unsubscribe
      ) => {

        try {

          unsubscribe();

        } catch (
          error
        ) {

          runtimeLogger.error("ADMIN_REALTIME", 

            "[ADMIN REALTIME CLEANUP ERROR]",

            error

          );

        }

      }
    );

    this.unsubscribers =
      [];

    this.initialized =
      false;

    runtimeLogger.info("ADMIN_REALTIME", 
      "[ADMIN REALTIME] DESTROYED"
    );

  }

}

const adminRealtimeBridge =
  new AdminRealtimeBridge();

export function connectAdminRealtime() {

  adminRealtimeBridge
    .initialize();

}

export function disconnectAdminRealtime() {

  adminRealtimeBridge
    .destroy();

}

export default
  adminRealtimeBridge;