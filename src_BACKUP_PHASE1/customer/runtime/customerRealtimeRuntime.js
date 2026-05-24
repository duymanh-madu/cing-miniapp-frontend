import {

  getRuntimeSocket,

  registerSocketListener,

} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * CUSTOMER REALTIME RUNTIME
 * =====================================================
 */

class CustomerRealtimeRuntime {

  socket = null;

  unsubscribers = [];

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    this.socket =
      getRuntimeSocket();

    if (
      !this.socket
    ) {

      return;

    }

    this.registerEvents();

    this.initialized =
      true;

  }

  registerEvents() {

    this.unsubscribers.push(

      registerSocketListener(

        "customer:profile:update",

        (
          payload
        ) => {

          console.log(
            "[CUSTOMER REALTIME]",
            payload
          );

        }

      )

    );

  }

  destroy() {

    this.unsubscribers.forEach(
      (
        unsubscribe
      ) => {

        unsubscribe();

      }
    );

    this.unsubscribers = [];

    this.initialized =
      false;

  }

}

const customerRealtimeRuntime =
  new CustomerRealtimeRuntime();

export default
  customerRealtimeRuntime;
