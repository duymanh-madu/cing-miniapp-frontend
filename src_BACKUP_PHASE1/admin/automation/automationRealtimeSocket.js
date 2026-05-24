import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import useAutomationStore from "./automationStore";

/**
 * =====================================================
 * AUTOMATION REALTIME SOCKET
 * =====================================================
 * GOVERNED
 * MEMORY SAFE
 * DUPLICATE SAFE
 * =====================================================
 */

class AutomationRealtimeSocket {

  initialized =
    false;

  unsubscribers =
    [];

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    /**
     * =================================================
     * EXECUTION EVENTS
     * =================================================
     */

    const unsubscribeExecution =
      registerSocketListener(

        "admin:automation:execution",

        (
          payload
        ) => {

          useAutomationStore
            .getState()
            .appendExecution(
              payload
            );

        }

      );

    /**
     * =================================================
     * METRICS EVENTS
     * =================================================
     */

    const unsubscribeMetrics =
      registerSocketListener(

        "admin:automation:metrics",

        (
          payload
        ) => {

          useAutomationStore
            .getState()
            .setAutomationMetrics(
              payload
            );

        }

      );

    /**
     * =================================================
     * TRACK CLEANUP
     * =================================================
     */

    this.unsubscribers.push(

      unsubscribeExecution,

      unsubscribeMetrics,

    );

    this.initialized =
      true;

    runtimeLogger.info("ADMIN_REALTIME", 
      "[AUTOMATION SOCKET] READY"
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

            "[AUTOMATION SOCKET CLEANUP ERROR]",

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
      "[AUTOMATION SOCKET] DESTROYED"
    );

  }

}

const automationRealtimeSocket =
  new AutomationRealtimeSocket();

export default
  automationRealtimeSocket;