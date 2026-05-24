import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useLoyaltyStore from "./loyaltyStore";

class LoyaltyRealtimeSocket {

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

      "admin:loyalty:update",

      (
        payload
      ) => {

        useLoyaltyStore
          .getState()
          .setLoyaltyMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const loyaltyRealtimeSocket =
  new LoyaltyRealtimeSocket();

export default
  loyaltyRealtimeSocket;