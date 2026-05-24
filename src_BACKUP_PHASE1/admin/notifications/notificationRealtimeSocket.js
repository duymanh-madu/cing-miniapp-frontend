import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import useNotificationStore from "./adminNotificationStore";

/**
 * =====================================================
 * NOTIFICATION REALTIME SOCKET
 * =====================================================
 * ENTERPRISE REALTIME GOVERNANCE
 * CENTRALIZED SOCKET FABRIC
 * ZALO WEBVIEW SAFE
 * MOBILE MEMORY SAFE
 * =====================================================
 */

class NotificationRealtimeSocket {

  initialized =
    false;

  unsubscribeDelivery =
    null;

  unsubscribeMetrics =
    null;

  /**
   * ===================================================
   * DELIVERY
   * ===================================================
   */

  handleDelivery =
    (
      payload
    ) => {

      useNotificationStore
        .getState()
        .appendRealtimeDelivery(
          payload
        );

    };

  /**
   * ===================================================
   * METRICS
   * ===================================================
   */

  handleMetrics =
    (
      payload
    ) => {

      useNotificationStore
        .getState()
        .setDeliveryMetrics(
          payload
        );

    };

  /**
   * ===================================================
   * INITIALIZE
   * ===================================================
   */

  initialize() {

    /**
     * ===============================================
     * SINGLETON PROTECTION
     * ===============================================
     */

    if (
      this.initialized
    ) {

      return;

    }

    /**
     * ===============================================
     * REGISTER LISTENERS
     * ===============================================
     */

    this.unsubscribeDelivery =
      registerSocketListener(

        "admin:notification:delivery",

        this.handleDelivery

      );

    this.unsubscribeMetrics =
      registerSocketListener(

        "admin:notification:metrics",

        this.handleMetrics

      );

    /**
     * ===============================================
     * READY
     * ===============================================
     */

    this.initialized =
      true;

  }

  /**
   * ===================================================
   * CLEANUP
   * ===================================================
   */

  cleanup() {

    /**
     * ===============================================
     * DELIVERY
     * ===============================================
     */

    this.unsubscribeDelivery?.();

    /**
     * ===============================================
     * METRICS
     * ===============================================
     */

    this.unsubscribeMetrics?.();

    /**
     * ===============================================
     * RESET
     * ===============================================
     */

    this.unsubscribeDelivery =
      null;

    this.unsubscribeMetrics =
      null;

    this.initialized =
      false;

  }

  /**
   * ===================================================
   * DESTROY
   * ===================================================
   */

  destroy() {

    this.cleanup();

  }

}

const notificationRealtimeSocket =
  new NotificationRealtimeSocket();

export default
  notificationRealtimeSocket;