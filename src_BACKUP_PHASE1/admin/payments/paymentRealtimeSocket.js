import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import usePaymentStore from "./paymentStore";

class PaymentRealtimeSocket {

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

      "admin:payment:update",

      (
        payload
      ) => {

        usePaymentStore
          .getState()
          .appendRealtimePayment(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const paymentRealtimeSocket =
  new PaymentRealtimeSocket();

export default
  paymentRealtimeSocket;