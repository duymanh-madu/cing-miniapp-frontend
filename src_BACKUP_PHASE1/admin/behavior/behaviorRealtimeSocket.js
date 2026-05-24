import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";

import useBehaviorStore from "./behaviorStore";

/**
 * =====================================================
 * BEHAVIOR REALTIME SOCKET
 * =====================================================
 * GOVERNED
 * MEMORY SAFE
 * DUPLICATE SAFE
 * =====================================================
 */

class BehaviorRealtimeSocket {

  initialized =
    false;

  unsubscribers =
    [];

  /**
   * ===================================================
   * HANDLERS
   * ===================================================
   */

  handleCustomerActivity =
    (
      payload
    ) => {

      useBehaviorStore
        .getState()
        .appendActivity(
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

    const unsubscribeActivity =
      registerSocketListener(

        "admin:customer:activity",

        this.handleCustomerActivity

      );

    this.unsubscribers.push(

      unsubscribeActivity

    );

    this.initialized =
      true;

    runtimeLogger.info("ADMIN_REALTIME", 
      "[BEHAVIOR SOCKET] READY"
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

            "[BEHAVIOR SOCKET CLEANUP ERROR]",

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
      "[BEHAVIOR SOCKET] DESTROYED"
    );

  }

}

const behaviorRealtimeSocket =
  new BehaviorRealtimeSocket();

export default
  behaviorRealtimeSocket;