import io from "socket.io-client";

import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerRealtimeRuntime {

  socket =
    null;

  initialize() {

    if (
      this.socket
    ) {

      return;

    }

    this.socket =
      io(
        import.meta.env
          .VITE_SOCKET_URL,
        {
          transports: [
            "websocket",
          ],
        }
      );

    this.registerEvents();

  }

  registerEvents() {

    this.socket.on(

      "customer:points",

      (payload) => {

        realtimeCustomerStore
          .getState()
          .setPoints(
            payload.points
          );

      }

    );

    this.socket.on(

      "customer:tier",

      (payload) => {

        realtimeCustomerStore
          .getState()
          .setTier(
            payload.tier
          );

      }

    );

    this.socket.on(

      "customer:vouchers",

      (payload) => {

        realtimeCustomerStore
          .getState()
          .setVouchers(
            payload.vouchers
          );

      }

    );

  }

}

const customerRealtimeRuntime =
  new CustomerRealtimeRuntime();

export default
  customerRealtimeRuntime;