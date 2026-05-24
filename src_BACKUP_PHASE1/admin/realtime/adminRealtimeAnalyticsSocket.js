import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import useAnalyticsStore from "../analytics/analyticsStore";

/**
 * =====================================================
 * ADMIN REALTIME ANALYTICS SOCKET
 * =====================================================
 * GOVERNED
 * MEMORY SAFE
 * DUPLICATE SAFE
 * =====================================================
 */

class AdminRealtimeAnalyticsSocket {

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
     * METRICS UPDATE
     * =================================================
     */

    const unsubscribeMetrics =
      registerSocketListener(

        "admin:metrics:update",

        (
          payload
        ) => {

          useAnalyticsStore
            .getState()
            .setMetrics(
              payload
            );

        }

      );

    /**
     * =================================================
     * EVENT FEED
     * =================================================
     */

    const unsubscribeEventFeed =
      registerSocketListener(

        "admin:event",

        (
          payload
        ) => {

          useAnalyticsStore
            .getState()
            .appendFeed(
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

      unsubscribeMetrics,

      unsubscribeEventFeed,

    );

    this.initialized =
      true;

    runtimeLogger.info("ADMIN_REALTIME", 
      "[ADMIN ANALYTICS SOCKET] READY"
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

            "[ADMIN ANALYTICS CLEANUP ERROR]",

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
      "[ADMIN ANALYTICS SOCKET] DESTROYED"
    );

  }

}

const adminRealtimeAnalyticsSocket =
  new AdminRealtimeAnalyticsSocket();

export default
  adminRealtimeAnalyticsSocket;