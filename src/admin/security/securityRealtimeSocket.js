import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useSecurityRuntimeStore from "./securityRuntimeStore";

class SecurityRealtimeSocket {

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

      "admin:security:event",

      (
        payload
      ) => {

        useSecurityRuntimeStore
          .getState()
          .appendSecurityEvent(
            payload
          );

      }

    );

    socket.on(

      "admin:security:threat",

      (
        payload
      ) => {

        useSecurityRuntimeStore
          .getState()
          .setActiveThreats(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const securityRealtimeSocket =
  new SecurityRealtimeSocket();

export default
  securityRealtimeSocket;