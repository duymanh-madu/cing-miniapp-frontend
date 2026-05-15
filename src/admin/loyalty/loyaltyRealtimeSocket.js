import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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