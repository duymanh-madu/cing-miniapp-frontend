import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useDevopsStore from "./devopsStore";

class DevopsRealtimeSocket {

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

      "admin:audit:log",

      (
        payload
      ) => {

        useDevopsStore
          .getState()
          .appendAuditLog(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const devopsRealtimeSocket =
  new DevopsRealtimeSocket();

export default
  devopsRealtimeSocket;