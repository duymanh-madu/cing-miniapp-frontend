import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import useOrderStore from "./orderStore";

/**
 * =====================================================
 * ORDER REALTIME SOCKET
 * =====================================================
 * GOVERNED
 * MEMORY SAFE
 * DUPLICATE SAFE
 * =====================================================
 */

class OrderRealtimeSocket {

  initialized =
    false;

  unsubscribers =
    [];

  /**
   * ===================================================
   * HANDLERS
   * ===================================================
   */

  handleNewOrder =
    (
      payload
    ) => {

      useOrderStore
        .getState()
        .appendRealtimeOrder(
          payload
        );

    };

  handleOrderMetrics =
    (
      payload
    ) => {

      useOrderStore
        .getState()
        .setOrderMetrics(
          payload
        );

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

    const unsubscribeNewOrder =
      registerSocketListener(

        "admin:order:new",

        this.handleNewOrder

      );

    const unsubscribeMetrics =
      registerSocketListener(

        "admin:order:metrics",

        this.handleOrderMetrics

      );

    this.unsubscribers.push(

      unsubscribeNewOrder,

      unsubscribeMetrics,

    );

    this.initialized =
      true;

    runtimeLogger.info(
      "ORDER",
      "[ADMIN SOCKET] READY"
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

          unsubscribe?.();

        } catch (
          error
        ) {

          runtimeLogger.error(

            "ORDER",

            "[ADMIN SOCKET CLEANUP ERROR]",

            error

          );

        }

      }
    );

    this.unsubscribers =
      [];

    this.initialized =
      false;

    runtimeLogger.info(
      "ORDER",
      "[ADMIN SOCKET] DESTROYED"
    );

  }

}

const orderRealtimeSocket =
  new OrderRealtimeSocket();

export default
  orderRealtimeSocket;
