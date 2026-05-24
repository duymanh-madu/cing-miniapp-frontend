import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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