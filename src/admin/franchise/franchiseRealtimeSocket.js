import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useFranchiseStore from "./franchiseStore";

class FranchiseRealtimeSocket {

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

      "admin:franchise:metrics",

      (
        payload
      ) => {

        useFranchiseStore
          .getState()
          .setBranchRealtimeMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const franchiseRealtimeSocket =
  new FranchiseRealtimeSocket();

export default
  franchiseRealtimeSocket;