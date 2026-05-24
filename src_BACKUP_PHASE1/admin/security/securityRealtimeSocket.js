import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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

    registerSocketListener(

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