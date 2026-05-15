import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useCustomer360Store from "./customer360Store";

class Customer360RealtimeSocket {

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

      "admin:customer:update",

      (
        payload
      ) => {

        const store =
          useCustomer360Store
            .getState();

        store.setCustomerInsights(
          payload
        );

      }

    );

    this.initialized =
      true;

  }

}

const customer360RealtimeSocket =
  new Customer360RealtimeSocket();

export default
  customer360RealtimeSocket;