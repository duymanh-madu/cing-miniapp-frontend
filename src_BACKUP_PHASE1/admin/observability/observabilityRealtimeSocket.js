import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import useObservabilityStore from "./observabilityStore";

/**
 * =====================================================
 * OBSERVABILITY REALTIME SOCKET
 * =====================================================
 * GOVERNED
 * MEMORY SAFE
 * DUPLICATE SAFE
 * =====================================================
 */

class ObservabilityRealtimeSocket {

  initialized =
    false;

  unsubscribers =
    [];

  /**
   * ===================================================
   * HANDLERS
   * ===================================================
   */

  handleRealtimeLog =
    (
      payload
    ) => {

      useObservabilityStore
        .getState()
        .appendRealtimeLog(
          payload
        );

    };

  handleHealthUpdate =
    (
      payload
    ) => {

      useObservabilityStore
        .getState()
        .setSystemHealth(
          payload
        );

    };

  handleIncident =
    (
      payload
    ) => {

      const store =
        useObservabilityStore
          .getState();

      store.setActiveIncidents([

        payload,

        ...store.activeIncidents,

      ]);

    };

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

    const unsubscribeLogs =
      registerSocketListener(

        "admin:logs:stream",

        this.handleRealtimeLog

      );

    const unsubscribeHealth =
      registerSocketListener(

        "admin:health:update",

        this.handleHealthUpdate

      );

    const unsubscribeIncident =
      registerSocketListener(

        "admin:incident:new",

        this.handleIncident

      );

    this.unsubscribers.push(

      unsubscribeLogs,

      unsubscribeHealth,

      unsubscribeIncident,

    );

    this.initialized =
      true;

    runtimeLogger.info("ADMIN_REALTIME", 
      "[OBSERVABILITY SOCKET] READY"
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

            "[OBSERVABILITY SOCKET CLEANUP ERROR]",

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
      "[OBSERVABILITY SOCKET] DESTROYED"
    );

  }

}

const observabilityRealtimeSocket =
  new ObservabilityRealtimeSocket();

export default
  observabilityRealtimeSocket;