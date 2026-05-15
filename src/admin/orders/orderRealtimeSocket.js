import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useOrderStore from "./orderStore";

class OrderRealtimeSocket {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    const socket =
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

      "admin:order:new",

      (
        payload
      ) => {

        useOrderStore
          .getState()
          .appendRealtimeOrder(
            payload
          );

      }

    );

    socket.on(

      "admin:order:metrics",

      (
        payload
      ) => {

        useOrderStore
          .getState()
          .setOrderMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const orderRealtimeSocket =
  new OrderRealtimeSocket();

export default
  orderRealtimeSocket;