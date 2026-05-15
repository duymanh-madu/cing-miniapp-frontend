import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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