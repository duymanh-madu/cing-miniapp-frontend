import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useAlertStore from "./alertStore";

class AlertRealtimeSocket {

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

      "admin:alert:new",

      (
        payload
      ) => {

        useAlertStore
          .getState()
          .appendAlert(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const alertRealtimeSocket =
  new AlertRealtimeSocket();

export default
  alertRealtimeSocket;